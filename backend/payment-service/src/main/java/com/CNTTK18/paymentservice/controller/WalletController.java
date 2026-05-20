package com.CNTTK18.paymentservice.controller;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.paymentservice.dto.UserRole;
import com.CNTTK18.paymentservice.dto.request.BankAccountRequest;
import com.CNTTK18.paymentservice.dto.request.CreatePayoutBatchRequest;
import com.CNTTK18.paymentservice.dto.request.RejectPayoutRequest;
import com.CNTTK18.paymentservice.dto.request.WithdrawRequest;
import com.CNTTK18.paymentservice.dto.response.AdminPayoutRequestsResponse;
import com.CNTTK18.paymentservice.dto.response.ApiResponse;
import com.CNTTK18.paymentservice.dto.response.BankAccountResponse;
import com.CNTTK18.paymentservice.dto.response.PayoutAccountBalanceResponse;
import com.CNTTK18.paymentservice.dto.response.PayoutBatchResponse;
import com.CNTTK18.paymentservice.dto.response.PayoutRequestResponse;
import com.CNTTK18.paymentservice.dto.response.WalletSummaryResponse;
import com.CNTTK18.paymentservice.dto.response.WalletTransactionsResponse;
import com.CNTTK18.paymentservice.exception.ForbiddenException;
import com.CNTTK18.paymentservice.model.data.PayoutRequestStatus;
import com.CNTTK18.paymentservice.service.WalletService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Validated
public class WalletController {
    private static final int MAX_PAGE_SIZE = 100;

    private final WalletService walletService;

    @GetMapping("/api/wallets")
    public ResponseEntity<ApiResponse<WalletSummaryResponse>> getWallet(@AuthenticationPrincipal UserRole userRole) {
        requireRole(userRole, "MERCHANT");
        return ResponseEntity.ok(ApiResponse.success(walletService.getWallet(userRole.getId())));
    }

    @GetMapping("/api/wallets/transactions")
    public ResponseEntity<ApiResponse<WalletTransactionsResponse>> getTransactions(
            @AuthenticationPrincipal UserRole userRole,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(MAX_PAGE_SIZE) int limit) {
        requireRole(userRole, "MERCHANT");
        return ResponseEntity.ok(
                ApiResponse.success(walletService.getTransactions(userRole.getId(), toPageable(page, limit))));
    }

    @GetMapping("/api/wallets/bank-accounts")
    public ResponseEntity<ApiResponse<List<BankAccountResponse>>> getBankAccounts(
            @AuthenticationPrincipal UserRole userRole) {
        requireRole(userRole, "MERCHANT");
        return ResponseEntity.ok(ApiResponse.success(walletService.getBankAccounts(userRole.getId())));
    }

    @PostMapping("/api/wallets/bank-accounts")
    public ResponseEntity<ApiResponse<BankAccountResponse>> createBankAccount(
            @AuthenticationPrincipal UserRole userRole, @Valid @RequestBody BankAccountRequest request) {
        requireRole(userRole, "MERCHANT");
        return ResponseEntity.ok(ApiResponse.success(walletService.createBankAccount(userRole.getId(), request)));
    }

    @PutMapping("/api/wallets/bank-accounts/{id}")
    public ResponseEntity<ApiResponse<BankAccountResponse>> updateBankAccount(
            @AuthenticationPrincipal UserRole userRole,
            @PathVariable UUID id,
            @Valid @RequestBody BankAccountRequest request) {
        requireRole(userRole, "MERCHANT");
        return ResponseEntity.ok(ApiResponse.success(walletService.updateBankAccount(userRole.getId(), id, request)));
    }

    @DeleteMapping("/api/wallets/bank-accounts/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBankAccount(
            @AuthenticationPrincipal UserRole userRole, @PathVariable UUID id) {
        requireRole(userRole, "MERCHANT");
        walletService.deleteBankAccount(userRole.getId(), id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Bank account deleted", null));
    }

    @PostMapping("/api/wallets/withdraw")
    public ResponseEntity<ApiResponse<PayoutRequestResponse>> requestWithdraw(
            @AuthenticationPrincipal UserRole userRole, @Valid @RequestBody WithdrawRequest request) {
        requireRole(userRole, "MERCHANT");
        return ResponseEntity.ok(ApiResponse.success(walletService.requestWithdraw(userRole.getId(), request)));
    }

    @GetMapping("/api/admin/wallets/payout-requests")
    public ResponseEntity<ApiResponse<AdminPayoutRequestsResponse>> getPayoutRequests(
            @AuthenticationPrincipal UserRole userRole,
            @RequestParam(required = false) PayoutRequestStatus status,
            @RequestParam(required = false) UUID merchantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(MAX_PAGE_SIZE) int limit) {
        requireRole(userRole, "ADMIN");
        return ResponseEntity.ok(ApiResponse.success(
                walletService.getPayoutRequests(status, merchantId, from, to, toPageable(page, limit))));
    }

    @PostMapping("/api/admin/wallets/payout-requests/{id}/approve")
    public ResponseEntity<ApiResponse<PayoutRequestResponse>> approvePayoutRequest(
            @AuthenticationPrincipal UserRole userRole, @PathVariable UUID id) {
        requireRole(userRole, "ADMIN");
        return ResponseEntity.ok(ApiResponse.success(walletService.approvePayoutRequest(userRole.getId(), id)));
    }

    @PostMapping("/api/admin/wallets/payout-requests/{id}/reject")
    public ResponseEntity<ApiResponse<PayoutRequestResponse>> rejectPayoutRequest(
            @AuthenticationPrincipal UserRole userRole,
            @PathVariable UUID id,
            @Valid @RequestBody RejectPayoutRequest request) {
        requireRole(userRole, "ADMIN");
        return ResponseEntity.ok(
                ApiResponse.success(walletService.rejectPayoutRequest(userRole.getId(), id, request.getReason())));
    }

    @PostMapping("/api/admin/wallets/payout-requests/{id}/retry")
    public ResponseEntity<ApiResponse<PayoutRequestResponse>> retryPayoutRequest(
            @AuthenticationPrincipal UserRole userRole, @PathVariable UUID id) {
        requireRole(userRole, "ADMIN");
        return ResponseEntity.ok(ApiResponse.success(walletService.retryPayoutRequest(userRole.getId(), id)));
    }

    @PostMapping("/api/admin/wallets/payout-batches")
    public ResponseEntity<ApiResponse<PayoutBatchResponse>> createPayoutBatch(
            @AuthenticationPrincipal UserRole userRole, @Valid @RequestBody CreatePayoutBatchRequest request) {
        requireRole(userRole, "ADMIN");
        return ResponseEntity.ok(ApiResponse.success(walletService.createPayoutBatch(userRole.getId(), request)));
    }

    @GetMapping("/api/admin/wallets/payout-account/balance")
    public ResponseEntity<ApiResponse<PayoutAccountBalanceResponse>> getPayoutAccountBalance(
            @AuthenticationPrincipal UserRole userRole) {
        requireRole(userRole, "ADMIN");
        return ResponseEntity.ok(ApiResponse.success(walletService.getPayoutAccountBalance()));
    }

    private void requireRole(UserRole userRole, String role) {
        if (userRole == null || !role.equalsIgnoreCase(userRole.getRole())) {
            throw new ForbiddenException("You are not authorized to access this resource");
        }
    }

    private Pageable toPageable(int page, int limit) {
        int pageIndex = Math.max(page, 1) - 1;
        int pageSize = Math.max(1, Math.min(limit, MAX_PAGE_SIZE));
        return PageRequest.of(pageIndex, pageSize, Sort.by("createdAt").descending());
    }
}
