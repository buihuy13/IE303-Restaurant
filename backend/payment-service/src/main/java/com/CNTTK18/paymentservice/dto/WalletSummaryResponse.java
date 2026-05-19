package com.CNTTK18.paymentservice.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletSummaryResponse {
    private UUID id;
    private UUID merchantId;
    private UUID restaurantId;
    private Long availableBalance;
    private Long pendingWithdrawal;
    private Long totalEarned;
    private Long totalWithdrawn;
    private Long balance;
    private BankAccountResponse defaultBankAccount;
}
