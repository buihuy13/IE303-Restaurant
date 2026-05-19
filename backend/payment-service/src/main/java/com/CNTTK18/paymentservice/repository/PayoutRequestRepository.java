package com.CNTTK18.paymentservice.repository;

import java.util.List;
import java.util.UUID;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import com.CNTTK18.paymentservice.model.PayoutRequest;
import com.CNTTK18.paymentservice.model.data.PayoutRequestStatus;

@Repository
public interface PayoutRequestRepository
        extends JpaRepository<PayoutRequest, UUID>, JpaSpecificationExecutor<PayoutRequest> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<PayoutRequest> findByIdIn(List<UUID> ids);

    long countByMerchantIdAndStatus(UUID merchantId, PayoutRequestStatus status);
}
