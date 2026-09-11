package org.example.couriermanagmentsystemweb.dto.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.couriermanagmentsystemweb.entity.Transaction;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponseDto {
    private Long id;
    private Long courierId;
    private String trackingNumber;
    private Double amount;
    private String paymentMethod;
    private String paymentStatus;
    private LocalDateTime transactionDate;

    public static TransactionResponseDto fromEntity(Transaction transaction) {
        if (transaction == null) return null;
        return TransactionResponseDto.builder()
                .id(transaction.getId())
                .courierId(transaction.getCourier() != null ? transaction.getCourier().getId() : null)
                .trackingNumber(transaction.getCourier() != null ? transaction.getCourier().getTrackingNumber() : null)
                .amount(transaction.getAmount())
                .paymentMethod(transaction.getPaymentMethod())
                .paymentStatus(transaction.getPaymentStatus() != null ? transaction.getPaymentStatus().name() : null)
                .transactionDate(transaction.getTransactionDate())
                .build();
    }
}
