package org.example.couriermanagmentsystemweb.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.couriermanagmentsystemweb.entity.Courier;
import org.example.couriermanagmentsystemweb.entity.Transaction;
import org.example.couriermanagmentsystemweb.enums.PaymentStatus;
import org.example.couriermanagmentsystemweb.repository.TransactionRepository;
import org.example.couriermanagmentsystemweb.service.TransactionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;

    @Override
    @Transactional
    public Transaction createTransaction(Courier courier, String paymentMethod) {
        Transaction transaction = new Transaction();
        transaction.setCourier(courier);
        transaction.setAmount(courier.getTotalFee() + courier.getCollectAmount());
        transaction.setPaymentMethod(paymentMethod != null ? paymentMethod : "CASH_ON_DELIVERY");
        transaction.setPaymentStatus(PaymentStatus.PENDING);

        Transaction saved = transactionRepository.save(transaction);
        log.info("Created transaction for courier {}", courier.getTrackingNumber());
        return saved;
    }

    @Override
    @Transactional
    public void markPaymentPaid(Long courierId) {
        Optional<Transaction> optionalTransaction = transactionRepository.findByCourierId(courierId);
        if (optionalTransaction.isPresent()) {
            Transaction transaction = optionalTransaction.get();
            transaction.setPaymentStatus(PaymentStatus.PAID);
            transactionRepository.save(transaction);
            log.info("Marked payment as PAID for courier ID {}", courierId);
        }
    }

    @Override
    public Optional<Transaction> getTransactionByCourierId(Long courierId) {
        return transactionRepository.findByCourierId(courierId);
    }

    @Override
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @Override
    public Double getTotalRevenue() {
        Double total = transactionRepository.calculatePlatformRevenue();
        return total != null ? total : 0.0;
    }

    @Override
    public Double getTotalCOD() {
        Double total = transactionRepository.calculateTotalCOD();
        return total != null ? total : 0.0;
    }

    @Override
    public Double getTotalTransactionValue() {
        Double total = transactionRepository.calculateTotalTransactionValue();
        return total != null ? total : 0.0;
    }
}
