package org.example.couriermanagmentsystemweb.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourierBookingDto {

    @NotBlank(message = "Receiver name is required")
    private String receiverName;

    @NotBlank(message = "Receiver phone is required")
    private String receiverPhone;

    @NotBlank(message = "Pickup street address is required")
    private String senderStreet;

    @NotBlank(message = "Pickup city is required")
    private String senderCity;

    @NotBlank(message = "Pickup zone is required")
    private String senderZone;

    private String senderPostal;

    @NotBlank(message = "Delivery street address is required")
    private String receiverStreet;

    @NotBlank(message = "Delivery city is required")
    private String receiverCity;

    @NotBlank(message = "Delivery zone is required")
    private String receiverZone;

    private String receiverPostal;

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be greater than zero")
    private Double weightKg;

    @PositiveOrZero(message = "Collect amount cannot be negative")
    private Double collectAmount = 0.0;
}
