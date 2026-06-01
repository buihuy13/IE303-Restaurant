package com.CNTTK18.paymentservice.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;

import com.CNTTK18.Common.Event.MerchantRevenueEvent;
import com.CNTTK18.paymentservice.dto.request.BankAccountRequest;
import com.CNTTK18.paymentservice.dto.request.CreatePayoutBatchRequest;
import com.CNTTK18.paymentservice.dto.request.WithdrawRequest;
import com.CNTTK18.paymentservice.dto.response.AdminPayoutRequestsResponse;
import com.CNTTK18.paymentservice.dto.response.BankAccountResponse;
import com.CNTTK18.paymentservice.dto.response.PayoutAccountBalanceResponse;
import com.CNTTK18.paymentservice.dto.response.PayoutBatchResponse;
import com.CNTTK18.paymentservice.dto.response.PayoutRequestResponse;
import com.CNTTK18.paymentservice.dto.response.WalletSummaryResponse;
import com.CNTTK18.paymentservice.dto.response.WalletTransactionsResponse;
import com.CNTTK18.paymentservice.model.data.PayoutRequestStatus;

public interface WalletService {
    WalletSummaryResponse getWallet(UUID merchantId);

    WalletTransactionsResponse getTransactions(UUID merchantId, Pageable pageable);

    List<BankAccountResponse> getBankAccounts(UUID merchantId);

    BankAccountResponse createBankAccount(UUID merchantId, BankAccountRequest request);

    BankAccountResponse updateBankAccount(UUID merchantId, UUID bankAccountId, BankAccountRequest request);

    void deleteBankAccount(UUID merchantId, UUID bankAccountId);

    PayoutRequestResponse requestWithdraw(UUID merchantId, WithdrawRequest request);

    AdminPayoutRequestsResponse getPayoutRequests(
            PayoutRequestStatus status, UUID merchantId, Instant from, Instant to, Pageable pageable);

    PayoutRequestResponse approvePayoutRequest(UUID adminId, UUID requestId);

    PayoutRequestResponse rejectPayoutRequest(UUID adminId, UUID requestId, String reason);

    PayoutBatchResponse createPayoutBatch(UUID adminId, CreatePayoutBatchRequest request);

    PayoutRequestResponse retryPayoutRequest(UUID adminId, UUID requestId);

    PayoutAccountBalanceResponse getPayoutAccountBalance();

    void creditMerchantRevenue(MerchantRevenueEvent event);
}
