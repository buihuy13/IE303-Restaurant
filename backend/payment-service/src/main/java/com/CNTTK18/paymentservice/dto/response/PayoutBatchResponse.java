package com.CNTTK18.paymentservice.dto.response;

import java.time.Instant;
import java.util.UUID;

import com.CNTTK18.paymentservice.model.data.PayoutBatchStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutBatchResponse {
    private UUID id;
    private PayoutBatchStatus status;
    private Long totalAmount;
    private Integer itemCount;
    private UUID requestedByAdminId;
    private String providerBatchId;
    private String providerReferenceId;
    private Instant createdAt;
    private Instant completedAt;
}
