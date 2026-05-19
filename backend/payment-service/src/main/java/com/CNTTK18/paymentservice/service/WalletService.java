package com.CNTTK18.paymentservice.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.CNTTK18.Common.Event.MerchantRevenueEvent;
import com.CNTTK18.paymentservice.dto.AdminPayoutRequestsResponse;
import com.CNTTK18.paymentservice.dto.BankAccountRequest;
import com.CNTTK18.paymentservice.dto.BankAccountResponse;
import com.CNTTK18.paymentservice.dto.CreatePayoutBatchRequest;
import com.CNTTK18.paymentservice.dto.PayoutAccountBalanceResponse;
import com.CNTTK18.paymentservice.dto.PayoutBatchResponse;
import com.CNTTK18.paymentservice.dto.PayoutRequestResponse;
import com.CNTTK18.paymentservice.dto.WalletSummaryResponse;
import com.CNTTK18.paymentservice.dto.WalletTransactionsResponse;
import com.CNTTK18.paymentservice.dto.WithdrawRequest;
import com.CNTTK18.paymentservice.model.data.PayoutRequestStatus;

public interface WalletService {
    WalletSummaryResponse getWallet(UUID merchantId);

    WalletTransactionsResponse getTransactions(UUID merchantId, int page, int limit);

    List<BankAccountResponse> getBankAccounts(UUID merchantId);

    BankAccountResponse createBankAccount(UUID merchantId, BankAccountRequest request);

    BankAccountResponse updateBankAccount(UUID merchantId, UUID bankAccountId, BankAccountRequest request);

    void deleteBankAccount(UUID merchantId, UUID bankAccountId);

    PayoutRequestResponse requestWithdraw(UUID merchantId, WithdrawRequest request);

    AdminPayoutRequestsResponse getPayoutRequests(
            PayoutRequestStatus status, UUID merchantId, Instant from, Instant to, int page, int limit);

    PayoutRequestResponse approvePayoutRequest(UUID adminId, UUID requestId);

    PayoutRequestResponse rejectPayoutRequest(UUID adminId, UUID requestId, String reason);

    PayoutBatchResponse createPayoutBatch(UUID adminId, CreatePayoutBatchRequest request);

    PayoutRequestResponse retryPayoutRequest(UUID adminId, UUID requestId);

    PayoutAccountBalanceResponse getPayoutAccountBalance();

    void creditMerchantRevenue(MerchantRevenueEvent event);
}
