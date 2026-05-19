package com.CNTTK18.paymentservice.repository;

import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.CNTTK18.paymentservice.model.MerchantWallet;

@Repository
public interface MerchantWalletRepository extends JpaRepository<MerchantWallet, UUID> {
    Optional<MerchantWallet> findByMerchantId(UUID merchantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select w from MerchantWallet w where w.merchantId = :merchantId")
    Optional<MerchantWallet> findByMerchantIdForUpdate(@Param("merchantId") UUID merchantId);
}
