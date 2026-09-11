package org.example.couriermanagmentsystemweb.repository;

import org.example.couriermanagmentsystemweb.entity.Courier;
import org.example.couriermanagmentsystemweb.enums.CourierStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourierRepository extends JpaRepository<Courier, Long> {
    Optional<Courier> findByTrackingNumber(String trackingNumber);
    List<Courier> findBySenderIdOrderByCreatedAtDesc(Long senderId);
    List<Courier> findByStatus(CourierStatus status);

    // Pickup zone: find parcels by sender zone (case-insensitive)
    @Query("SELECT c FROM Courier c WHERE LOWER(c.pickupAddress.zone) = LOWER(:zone) AND c.status = :status")
    List<Courier> findByPickupZoneAndStatus(@Param("zone") String zone, @Param("status") CourierStatus status);

    // Delivery zone: find parcels by receiver zone (case-insensitive)
    @Query("SELECT c FROM Courier c WHERE LOWER(c.deliveryAddress.zone) = LOWER(:zone) AND c.status = :status")
    List<Courier> findByDeliveryZoneAndStatus(@Param("zone") String zone, @Param("status") CourierStatus status);

    // Parcels assigned to pickup employee
    List<Courier> findByAssignedEmployeeId(Long employeeId);

    // Parcels assigned to delivery employee
    List<Courier> findByDeliveryEmployeeId(Long employeeId);

    @Query("SELECT COUNT(c) FROM Courier c WHERE c.status = 'DELIVERED'")
    long countDeliveredCouriers();
}
