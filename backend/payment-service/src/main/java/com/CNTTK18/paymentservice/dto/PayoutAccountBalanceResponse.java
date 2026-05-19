package com.CNTTK18.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutAccountBalanceResponse {
    private boolean dryRun;
    private boolean enabled;
    private String accountNumber;
    private String accountName;
    private String currency;
    private String balance;
}
