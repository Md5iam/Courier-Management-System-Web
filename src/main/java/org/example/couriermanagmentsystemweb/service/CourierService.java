package org.example.couriermanagmentsystemweb.service;

import org.example.couriermanagmentsystemweb.dto.CourierBookingDto;
import org.example.couriermanagmentsystemweb.entity.Courier;
import org.example.couriermanagmentsystemweb.entity.User;
import org.example.couriermanagmentsystemweb.enums.CourierStatus;

import java.util.List;
import java.util.Optional;

public interface CourierService {
    Courier bookCourier(CourierBookingDto bookingDto, User sender);
    Optional<Courier> findByTrackingNumber(String trackingNumber);
    Optional<Courier> findById(Long id);
    List<Courier> getCouriersBySender(Long senderId);
    List<Courier> getCouriersByStatus(CourierStatus status);

    // Pickup zone: PENDING parcels in sender's zone
    List<Courier> getCouriersByPickupZoneAndStatus(String zone, CourierStatus status);

    // Delivery zone: IN_TRANSIT parcels heading to receiver's zone
    List<Courier> getCouriersByDeliveryZoneAndStatus(String zone, CourierStatus status);

    // Parcels assigned to pickup employee
    List<Courier> getCouriersByPickupEmployee(Long employeeId);

    // Parcels assigned to delivery employee
    List<Courier> getCouriersByDeliveryEmployee(Long employeeId);

    List<Courier> getAllCouriers();
    
    void updateCourierStatus(Long courierId, CourierStatus status, User employee);
    void cancelCourier(Long courierId, User user);
    long countTotalCouriers();
    long countDeliveredCouriers();
}
