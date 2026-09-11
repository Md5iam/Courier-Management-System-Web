package org.example.couriermanagmentsystemweb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.couriermanagmentsystemweb.enums.CourierStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "couriers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Courier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String trackingNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false)
    private String receiverName;

    @Column(nullable = false)
    private String receiverPhone;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "streetAddress", column = @Column(name = "sender_street")),
            @AttributeOverride(name = "city", column = @Column(name = "sender_city")),
            @AttributeOverride(name = "zone", column = @Column(name = "sender_zone")),
            @AttributeOverride(name = "postalCode", column = @Column(name = "sender_postal"))
    })
    private Address pickupAddress;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "streetAddress", column = @Column(name = "receiver_street")),
            @AttributeOverride(name = "city", column = @Column(name = "receiver_city")),
            @AttributeOverride(name = "zone", column = @Column(name = "receiver_zone")),
            @AttributeOverride(name = "postalCode", column = @Column(name = "receiver_postal"))
    })
    private Address deliveryAddress;

    @Column(nullable = false)
    private Double weightKg;

    @Column(nullable = false)
    private Double totalFee;

    @Column(nullable = false)
    private Double collectAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourierStatus status = CourierStatus.PENDING;

    // Employee who picks up the parcel from sender (pickup zone)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_employee_id")
    private User assignedEmployee;

    // Employee who delivers the parcel to receiver (delivery zone)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_employee_id")
    private User deliveryEmployee;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
