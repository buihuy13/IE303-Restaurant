package com.CNTTK18.paymentservice.dto.response;

import java.time.Instant;
import java.util.UUID;

import com.CNTTK18.paymentservice.model.data.WalletTransactionStatus;
import com.CNTTK18.paymentservice.model.data.WalletTransactionType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransactionResponse {
    private UUID id;
    private WalletTransactionType type;
    private Long amount;
    private WalletTransactionStatus status;
    private String description;
    private Instant createdAt;
}
