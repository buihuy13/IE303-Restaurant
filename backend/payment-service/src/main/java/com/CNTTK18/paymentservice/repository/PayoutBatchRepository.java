package com.CNTTK18.paymentservice.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CNTTK18.paymentservice.model.PayoutBatch;

@Repository
public interface PayoutBatchRepository extends JpaRepository<PayoutBatch, UUID> {}
