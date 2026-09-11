package org.example.couriermanagmentsystemweb.repository;

import org.example.couriermanagmentsystemweb.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByCourierId(Long courierId);

    // Platform revenue = sum of delivery fees only (totalFee from courier)
    @Query("SELECT COALESCE(SUM(t.courier.totalFee), 0) FROM Transaction t WHERE t.paymentStatus = 'PAID'")
    Double calculatePlatformRevenue();

    // Total COD = sum of collect amounts (cash on delivery collected from receiver)
    @Query("SELECT COALESCE(SUM(t.courier.collectAmount), 0) FROM Transaction t WHERE t.paymentStatus = 'PAID'")
    Double calculateTotalCOD();

    // Total transaction value = delivery fee + COD (all money flowing through system)
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.paymentStatus = 'PAID'")
    Double calculateTotalTransactionValue();
}
