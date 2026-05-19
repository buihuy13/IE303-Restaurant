package com.CNTTK18.paymentservice.dto;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankAccountResponse {
    private UUID id;
    private String bankName;
    private String bankBin;
    private String accountNumber;
    private String accountHolderName;
    private boolean defaultAccount;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
