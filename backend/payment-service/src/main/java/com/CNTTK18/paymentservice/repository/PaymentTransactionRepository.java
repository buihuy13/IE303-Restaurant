package com.CNTTK18.paymentservice.repository;

import com.CNTTK18.paymentservice.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {
    
    // Hàm truy vấn giao dịch theo mã order code
    Optional<PaymentTransaction> findByOrderCode(Long orderCode);
}
