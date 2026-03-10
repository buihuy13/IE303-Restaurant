package com.CNTTK18.paymentservice.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CNTTK18.paymentservice.model.PaymentTransaction;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {

    // Hàm truy vấn giao dịch theo mã order code
    Optional<PaymentTransaction> findByOrderCode(Long orderCode);
}
