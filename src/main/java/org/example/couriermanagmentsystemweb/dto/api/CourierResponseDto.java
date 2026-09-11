package org.example.couriermanagmentsystemweb.dto.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.couriermanagmentsystemweb.entity.Address;
import org.example.couriermanagmentsystemweb.entity.Courier;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourierResponseDto {
    private Long id;
    private String trackingNumber;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String senderPhone;
    private String receiverName;
    private String receiverPhone;
    private Address pickupAddress;
    private Address deliveryAddress;
    private Double weightKg;
    private Double totalFee;
    private Double collectAmount;
    private String status;
    private String pickupEmployeeName;
    private String deliveryEmployeeName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CourierResponseDto fromEntity(Courier courier) {
        if (courier == null) return null;
        
        String pickupEmpName = null;
        try {
            if (courier.getAssignedEmployee() != null) {
                pickupEmpName = courier.getAssignedEmployee().getFullName();
            }
        } catch (Exception ignored) {}

        String deliveryEmpName = null;
        try {
            if (courier.getDeliveryEmployee() != null) {
                deliveryEmpName = courier.getDeliveryEmployee().getFullName();
            }
        } catch (Exception ignored) {}

        return CourierResponseDto.builder()
                .id(courier.getId())
                .trackingNumber(courier.getTrackingNumber())
                .senderId(courier.getSender() != null ? courier.getSender().getId() : null)
                .senderName(courier.getSender() != null ? courier.getSender().getFullName() : null)
                .senderEmail(courier.getSender() != null ? courier.getSender().getEmail() : null)
                .senderPhone(courier.getSender() != null ? courier.getSender().getPhone() : null)
                .receiverName(courier.getReceiverName())
                .receiverPhone(courier.getReceiverPhone())
                .pickupAddress(courier.getPickupAddress())
                .deliveryAddress(courier.getDeliveryAddress())
                .weightKg(courier.getWeightKg())
                .totalFee(courier.getTotalFee())
                .collectAmount(courier.getCollectAmount())
                .status(courier.getStatus() != null ? courier.getStatus().name() : null)
                .pickupEmployeeName(pickupEmpName)
                .deliveryEmployeeName(deliveryEmpName)
                .createdAt(courier.getCreatedAt())
                .updatedAt(courier.getUpdatedAt())
                .build();
    }
}
