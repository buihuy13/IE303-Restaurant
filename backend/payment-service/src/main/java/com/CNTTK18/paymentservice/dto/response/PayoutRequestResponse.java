package com.CNTTK18.paymentservice.dto.response;

import java.time.Instant;
import java.util.UUID;

import com.CNTTK18.paymentservice.model.data.PayoutRequestStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutRequestResponse {
    private UUID id;
    private UUID walletId;
    private UUID merchantId;
    private Long amount;
    private BankInfoResponse bankInfo;
    private String note;
    private PayoutRequestStatus status;
    private String rejectionReason;
    private UUID processedByAdminId;
    private String provider;
    private String providerReferenceId;
    private String providerPayoutId;
    private UUID payoutBatchId;
    private Instant processedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
