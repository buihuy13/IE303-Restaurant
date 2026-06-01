package com.CNTTK18.paymentservice.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CNTTK18.paymentservice.model.MerchantBankAccount;

@Repository
public interface MerchantBankAccountRepository extends JpaRepository<MerchantBankAccount, UUID> {
    List<MerchantBankAccount> findByMerchantIdAndActiveTrueOrderByDefaultAccountDescCreatedAtDesc(UUID merchantId);

    Optional<MerchantBankAccount> findByIdAndMerchantIdAndActiveTrue(UUID id, UUID merchantId);

    Optional<MerchantBankAccount> findFirstByMerchantIdAndDefaultAccountTrueAndActiveTrue(UUID merchantId);

    boolean existsByMerchantIdAndActiveTrue(UUID merchantId);
}
