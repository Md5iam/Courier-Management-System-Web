package org.example.couriermanagmentsystemweb.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackingRequestDto {

    @NotBlank(message = "Tracking number is required")
    private String trackingNumber;
}
