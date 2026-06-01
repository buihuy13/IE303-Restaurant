package com.CNTTK18.paymentservice.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CNTTK18.paymentservice.model.WalletTransaction;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID> {
    Optional<WalletTransaction> findByReferenceKey(String referenceKey);

    Page<WalletTransaction> findByMerchantIdOrderByCreatedAtDesc(UUID merchantId, Pageable pageable);
}
