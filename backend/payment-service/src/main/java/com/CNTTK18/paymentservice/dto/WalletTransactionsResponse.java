package com.CNTTK18.paymentservice.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransactionsResponse {
    private List<WalletTransactionResponse> transactions;
    private PaginationResponse pagination;
}
