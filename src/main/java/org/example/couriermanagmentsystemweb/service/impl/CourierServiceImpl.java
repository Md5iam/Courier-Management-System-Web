package org.example.couriermanagmentsystemweb.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.couriermanagmentsystemweb.dto.CourierBookingDto;
import org.example.couriermanagmentsystemweb.entity.Address;
import org.example.couriermanagmentsystemweb.entity.Courier;
import org.example.couriermanagmentsystemweb.entity.User;
import org.example.couriermanagmentsystemweb.enums.CourierStatus;
import org.example.couriermanagmentsystemweb.repository.CourierRepository;
import org.example.couriermanagmentsystemweb.service.CourierService;
import org.example.couriermanagmentsystemweb.service.TransactionService;
import org.example.couriermanagmentsystemweb.service.strategy.PricingStrategy;
import org.example.couriermanagmentsystemweb.util.TrackingNumberGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourierServiceImpl implements CourierService {

    private final CourierRepository courierRepository;
    private final PricingStrategy pricingStrategy;
    private final TransactionService transactionService;

    // Valid status transitions: current status -> allowed next statuses
    private static final Map<CourierStatus, Set<CourierStatus>> VALID_TRANSITIONS = Map.of(
            CourierStatus.PENDING, Set.of(CourierStatus.PICKED_UP, CourierStatus.CANCELLED),
            CourierStatus.PICKED_UP, Set.of(CourierStatus.IN_TRANSIT),
            CourierStatus.IN_TRANSIT, Set.of(CourierStatus.OUT_FOR_DELIVERY),
            CourierStatus.OUT_FOR_DELIVERY, Set.of(CourierStatus.DELIVERED),
            CourierStatus.DELIVERED, Set.of(),     // final state, no transitions
            CourierStatus.CANCELLED, Set.of()      // final state, no transitions
    );

    @Override
    @Transactional
    public Courier bookCourier(CourierBookingDto dto, User sender) {
        // Validate collect amount is not negative
        if (dto.getCollectAmount() != null && dto.getCollectAmount() < 0) {
            throw new IllegalArgumentException("Collect amount cannot be negative.");
        }

        // Validate weight is positive
        if (dto.getWeightKg() == null || dto.getWeightKg() <= 0) {
            throw new IllegalArgumentException("Weight must be greater than zero.");
        }

        Courier courier = new Courier();
        courier.setTrackingNumber(TrackingNumberGenerator.generateTrackingNumber());
        courier.setSender(sender);
        courier.setReceiverName(dto.getReceiverName());
        courier.setReceiverPhone(dto.getReceiverPhone());

        Address pickupAddress = new Address(dto.getSenderStreet(), dto.getSenderCity(), dto.getSenderZone(), dto.getSenderPostal());
        Address deliveryAddress = new Address(dto.getReceiverStreet(), dto.getReceiverCity(), dto.getReceiverZone(), dto.getReceiverPostal());

        courier.setPickupAddress(pickupAddress);
        courier.setDeliveryAddress(deliveryAddress);
        courier.setWeightKg(dto.getWeightKg());

        double fee = pricingStrategy.calculateFee(dto.getWeightKg());
        courier.setTotalFee(fee);
        courier.setCollectAmount(dto.getCollectAmount() != null ? dto.getCollectAmount() : 0.0);
        courier.setStatus(CourierStatus.PENDING);

        Courier savedCourier = courierRepository.save(courier);

        transactionService.createTransaction(savedCourier, "CASH_ON_DELIVERY");

        log.info("Booked courier {} for sender {}", savedCourier.getTrackingNumber(), sender.getEmail());
        return savedCourier;
    }

    @Override
    public Optional<Courier> findByTrackingNumber(String trackingNumber) {
        return courierRepository.findByTrackingNumber(trackingNumber.trim());
    }

    @Override
    public Optional<Courier> findById(Long id) {
        return courierRepository.findById(id);
    }

    @Override
    public List<Courier> getCouriersBySender(Long senderId) {
        return courierRepository.findBySenderIdOrderByCreatedAtDesc(senderId);
    }

    @Override
    public List<Courier> getCouriersByStatus(CourierStatus status) {
        return courierRepository.findByStatus(status);
    }

    @Override
    public List<Courier> getCouriersByPickupZoneAndStatus(String zone, CourierStatus status) {
        return courierRepository.findByPickupZoneAndStatus(zone, status);
    }

    @Override
    public List<Courier> getCouriersByDeliveryZoneAndStatus(String zone, CourierStatus status) {
        return courierRepository.findByDeliveryZoneAndStatus(zone, status);
    }

    @Override
    public List<Courier> getCouriersByPickupEmployee(Long employeeId) {
        return courierRepository.findByAssignedEmployeeId(employeeId);
    }

    @Override
    public List<Courier> getCouriersByDeliveryEmployee(Long employeeId) {
        return courierRepository.findByDeliveryEmployeeId(employeeId);
    }

    @Override
    public List<Courier> getAllCouriers() {
        return courierRepository.findAll();
    }

    @Override
    @Transactional
    public void updateCourierStatus(Long courierId, CourierStatus newStatus, User employee) {
        Courier courier = courierRepository.findById(courierId)
                .orElseThrow(() -> new IllegalArgumentException("Courier not found"));

        CourierStatus currentStatus = courier.getStatus();

        // Validate status transition is allowed
        Set<CourierStatus> allowedNext = VALID_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowedNext.contains(newStatus)) {
            throw new IllegalStateException(
                    "Invalid status transition: " + currentStatus + " → " + newStatus +
                    ". Allowed transitions: " + allowedNext
            );
        }

        String employeeZone = employee.getAssignedZone() != null ? employee.getAssignedZone() : "";

        // PENDING → PICKED_UP: only pickup-zone employee can claim
        if (newStatus == CourierStatus.PICKED_UP) {
            String pickupZone = courier.getPickupAddress().getZone() != null ? courier.getPickupAddress().getZone() : "";
            if (!pickupZone.equalsIgnoreCase(employeeZone)) {
                throw new IllegalStateException(
                        "You can only pick up parcels from your assigned zone (" + employeeZone +
                        "). This parcel's pickup zone is: " + pickupZone
                );
            }
            courier.setAssignedEmployee(employee);
        }

        // PICKED_UP → IN_TRANSIT: only the same pickup employee can send it
        if (newStatus == CourierStatus.IN_TRANSIT) {
            if (courier.getAssignedEmployee() == null || !courier.getAssignedEmployee().getId().equals(employee.getId())) {
                throw new IllegalStateException("Only the pickup employee who claimed this parcel can send it to transit.");
            }
        }

        // IN_TRANSIT → OUT_FOR_DELIVERY: only delivery-zone employee can claim
        if (newStatus == CourierStatus.OUT_FOR_DELIVERY) {
            String deliveryZone = courier.getDeliveryAddress().getZone() != null ? courier.getDeliveryAddress().getZone() : "";
            if (!deliveryZone.equalsIgnoreCase(employeeZone)) {
                throw new IllegalStateException(
                        "You can only claim deliveries for your assigned zone (" + employeeZone +
                        "). This parcel's delivery zone is: " + deliveryZone
                );
            }
            courier.setDeliveryEmployee(employee);
        }

        // OUT_FOR_DELIVERY → DELIVERED: only the assigned delivery employee
        if (newStatus == CourierStatus.DELIVERED) {
            if (courier.getDeliveryEmployee() == null || !courier.getDeliveryEmployee().getId().equals(employee.getId())) {
                throw new IllegalStateException("Only the delivery employee who claimed this parcel can mark it as delivered.");
            }
            transactionService.markPaymentPaid(courierId);
        }

        courier.setStatus(newStatus);
        courierRepository.save(courier);
        log.info("Updated courier {} status: {} → {}", courier.getTrackingNumber(), currentStatus, newStatus);
    }

    @Override
    @Transactional
    public void cancelCourier(Long courierId, User user) {
        Courier courier = courierRepository.findById(courierId)
                .orElseThrow(() -> new IllegalArgumentException("Courier not found"));

        if (courier.getStatus() != CourierStatus.PENDING) {
            throw new IllegalStateException("Only PENDING couriers can be cancelled. Current status: " + courier.getStatus());
        }

        courier.setStatus(CourierStatus.CANCELLED);
        courierRepository.save(courier);
        log.info("Cancelled courier {}", courier.getTrackingNumber());
    }

    @Override
    public long countTotalCouriers() {
        return courierRepository.count();
    }

    @Override
    public long countDeliveredCouriers() {
        return courierRepository.countDeliveredCouriers();
    }
}
