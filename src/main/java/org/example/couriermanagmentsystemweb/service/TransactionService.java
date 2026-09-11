package org.example.couriermanagmentsystemweb.service;

import org.example.couriermanagmentsystemweb.entity.Courier;
import org.example.couriermanagmentsystemweb.entity.Transaction;

import java.util.List;
import java.util.Optional;

public interface TransactionService {
    Transaction createTransaction(Courier courier, String paymentMethod);
    void markPaymentPaid(Long courierId);
    Optional<Transaction> getTransactionByCourierId(Long courierId);
    List<Transaction> getAllTransactions();
    Double getTotalRevenue();
    Double getTotalCOD();
    Double getTotalTransactionValue();
}
