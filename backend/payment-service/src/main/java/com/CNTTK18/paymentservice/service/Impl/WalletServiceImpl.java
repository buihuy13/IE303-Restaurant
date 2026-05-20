package com.CNTTK18.paymentservice.service.Impl;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.criteria.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Event.MerchantRevenueEvent;
import com.CNTTK18.paymentservice.config.properties.PayOSProperties;
import com.CNTTK18.paymentservice.dto.request.BankAccountRequest;
import com.CNTTK18.paymentservice.dto.request.CreatePayoutBatchRequest;
import com.CNTTK18.paymentservice.dto.request.WithdrawRequest;
import com.CNTTK18.paymentservice.dto.response.AdminPayoutRequestsResponse;
import com.CNTTK18.paymentservice.dto.response.BankAccountResponse;
import com.CNTTK18.paymentservice.dto.response.BankInfoResponse;
import com.CNTTK18.paymentservice.dto.response.PaginationResponse;
import com.CNTTK18.paymentservice.dto.response.PayoutAccountBalanceResponse;
import com.CNTTK18.paymentservice.dto.response.PayoutBatchResponse;
import com.CNTTK18.paymentservice.dto.response.PayoutRequestResponse;
import com.CNTTK18.paymentservice.dto.response.WalletSummaryResponse;
import com.CNTTK18.paymentservice.dto.response.WalletTransactionResponse;
import com.CNTTK18.paymentservice.dto.response.WalletTransactionsResponse;
import com.CNTTK18.paymentservice.exception.BadRequestException;
import com.CNTTK18.paymentservice.exception.NotFoundException;
import com.CNTTK18.paymentservice.model.MerchantBankAccount;
import com.CNTTK18.paymentservice.model.MerchantWallet;
import com.CNTTK18.paymentservice.model.PayoutBatch;
import com.CNTTK18.paymentservice.model.PayoutRequest;
import com.CNTTK18.paymentservice.model.WalletTransaction;
import com.CNTTK18.paymentservice.model.data.PayoutBatchStatus;
import com.CNTTK18.paymentservice.model.data.PayoutRequestStatus;
import com.CNTTK18.paymentservice.model.data.WalletTransactionStatus;
import com.CNTTK18.paymentservice.model.data.WalletTransactionType;
import com.CNTTK18.paymentservice.repository.MerchantBankAccountRepository;
import com.CNTTK18.paymentservice.repository.MerchantWalletRepository;
import com.CNTTK18.paymentservice.repository.PayoutBatchRepository;
import com.CNTTK18.paymentservice.repository.PayoutRequestRepository;
import com.CNTTK18.paymentservice.repository.WalletTransactionRepository;
import com.CNTTK18.paymentservice.service.WalletService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import vn.payos.PayOS;
import vn.payos.model.v1.payouts.Payout;
import vn.payos.model.v1.payouts.batch.PayoutBatchItem;
import vn.payos.model.v1.payouts.batch.PayoutBatchRequest;
import vn.payos.model.v1.payoutsAccount.PayoutAccountInfo;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletServiceImpl implements WalletService {
    private static final String PAYOS_PROVIDER = "PAYOS";
    private static final String DRY_RUN_PROVIDER = "PAYOS_DRY_RUN";

    private final MerchantWalletRepository walletRepository;
    private final MerchantBankAccountRepository bankAccountRepository;
    private final WalletTransactionRepository transactionRepository;
    private final PayoutRequestRepository payoutRequestRepository;
    private final PayoutBatchRepository payoutBatchRepository;
    private final PayOSProperties payOSProperties;
    private final ObjectMapper objectMapper;

    @Autowired
    @Qualifier("payOSPayout")
    private PayOS payOSPayout;

    @Override
    @Transactional(readOnly = true)
    public WalletSummaryResponse getWallet(UUID merchantId) {
        MerchantWallet wallet = walletRepository.findByMerchantId(merchantId).orElseGet(() -> MerchantWallet.builder()
                .merchantId(merchantId)
                .availableBalance(0L)
                .pendingWithdrawal(0L)
                .totalEarned(0L)
                .totalWithdrawn(0L)
                .build());
        BankAccountResponse defaultBankAccount = bankAccountRepository
                .findFirstByMerchantIdAndDefaultAccountTrueAndActiveTrue(merchantId)
                .map(this::toBankAccountResponse)
                .orElse(null);
        return toWalletSummary(wallet, defaultBankAccount);
    }

    @Override
    @Transactional(readOnly = true)
    public WalletTransactionsResponse getTransactions(UUID merchantId, Pageable pageable) {
        Page<WalletTransaction> txPage =
                transactionRepository.findByMerchantIdOrderByCreatedAtDesc(merchantId, pageable);
        return WalletTransactionsResponse.builder()
                .transactions(txPage.getContent().stream()
                        .map(this::toWalletTransactionResponse)
                        .toList())
                .pagination(toPagination(txPage))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BankAccountResponse> getBankAccounts(UUID merchantId) {
        return bankAccountRepository
                .findByMerchantIdAndActiveTrueOrderByDefaultAccountDescCreatedAtDesc(merchantId)
                .stream()
                .map(this::toBankAccountResponse)
                .toList();
    }

    @Override
    @Transactional
    public BankAccountResponse createBankAccount(UUID merchantId, BankAccountRequest request) {
        boolean makeDefault = Boolean.TRUE.equals(request.getDefaultAccount())
                || !bankAccountRepository.existsByMerchantIdAndActiveTrue(merchantId);
        if (makeDefault) {
            clearDefaultBankAccount(merchantId);
        }

        MerchantBankAccount bankAccount = MerchantBankAccount.builder()
                .merchantId(merchantId)
                .bankName(request.getBankName().trim())
                .bankBin(request.getBankBin().trim())
                .accountNumber(request.getAccountNumber().trim())
                .accountHolderName(request.getAccountHolderName().trim())
                .defaultAccount(makeDefault)
                .active(true)
                .build();
        return toBankAccountResponse(bankAccountRepository.save(bankAccount));
    }

    @Override
    @Transactional
    public BankAccountResponse updateBankAccount(UUID merchantId, UUID bankAccountId, BankAccountRequest request) {
        MerchantBankAccount bankAccount = bankAccountRepository
                .findByIdAndMerchantIdAndActiveTrue(bankAccountId, merchantId)
                .orElseThrow(() -> new NotFoundException("Bank account not found"));

        if (Boolean.TRUE.equals(request.getDefaultAccount())) {
            clearDefaultBankAccount(merchantId);
            bankAccount.setDefaultAccount(true);
        }

        bankAccount.setBankName(request.getBankName().trim());
        bankAccount.setBankBin(request.getBankBin().trim());
        bankAccount.setAccountNumber(request.getAccountNumber().trim());
        bankAccount.setAccountHolderName(request.getAccountHolderName().trim());
        return toBankAccountResponse(bankAccountRepository.save(bankAccount));
    }

    @Override
    @Transactional
    public void deleteBankAccount(UUID merchantId, UUID bankAccountId) {
        MerchantBankAccount bankAccount = bankAccountRepository
                .findByIdAndMerchantIdAndActiveTrue(bankAccountId, merchantId)
                .orElseThrow(() -> new NotFoundException("Bank account not found"));
        bankAccount.setActive(false);
        bankAccount.setDefaultAccount(false);
        bankAccountRepository.save(bankAccount);
    }

    @Override
    @Transactional
    public PayoutRequestResponse requestWithdraw(UUID merchantId, WithdrawRequest request) {
        MerchantWallet wallet = getOrCreateWalletForUpdate(merchantId, null);
        MerchantBankAccount bankAccount = bankAccountRepository
                .findByIdAndMerchantIdAndActiveTrue(request.getBankAccountId(), merchantId)
                .orElseThrow(() -> new NotFoundException("Bank account not found"));

        if (request.getAmount() <= 0) {
            throw new BadRequestException("Withdrawal amount must be greater than 0");
        }
        if (wallet.getAvailableBalance() < request.getAmount()) {
            throw new BadRequestException("Insufficient wallet balance");
        }

        wallet.setAvailableBalance(wallet.getAvailableBalance() - request.getAmount());
        wallet.setPendingWithdrawal(wallet.getPendingWithdrawal() + request.getAmount());
        walletRepository.save(wallet);

        PayoutRequest payoutRequest = PayoutRequest.builder()
                .wallet(wallet)
                .merchantId(merchantId)
                .amount(request.getAmount())
                .bankName(bankAccount.getBankName())
                .bankBin(bankAccount.getBankBin())
                .accountNumber(bankAccount.getAccountNumber())
                .accountHolderName(bankAccount.getAccountHolderName())
                .status(PayoutRequestStatus.PENDING)
                .note(blankToNull(request.getNote()))
                .build();
        payoutRequest = payoutRequestRepository.save(payoutRequest);

        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .merchantId(merchantId)
                .restaurantId(wallet.getRestaurantId())
                .type(WalletTransactionType.WITHDRAW)
                .status(WalletTransactionStatus.PENDING)
                .amount(-request.getAmount())
                .description("Withdrawal request " + payoutRequest.getId())
                .referenceKey("payout_request:" + payoutRequest.getId())
                .build();
        transaction = transactionRepository.save(transaction);

        payoutRequest.setWalletTransaction(transaction);
        return toPayoutRequestResponse(payoutRequestRepository.save(payoutRequest));
    }

    @Override
    @Transactional(readOnly = true)
    public AdminPayoutRequestsResponse getPayoutRequests(
            PayoutRequestStatus status, UUID merchantId, Instant from, Instant to, Pageable pageable) {
        Specification<PayoutRequest> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (merchantId != null) {
                predicates.add(criteriaBuilder.equal(root.get("merchantId"), merchantId));
            }
            if (from != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (to != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), to));
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<PayoutRequest> requestPage = payoutRequestRepository.findAll(spec, pageable);
        return AdminPayoutRequestsResponse.builder()
                .requests(requestPage.getContent().stream()
                        .map(this::toPayoutRequestResponse)
                        .toList())
                .pagination(toPagination(requestPage))
                .build();
    }

    @Override
    @Transactional
    public PayoutRequestResponse approvePayoutRequest(UUID adminId, UUID requestId) {
        PayoutRequest payoutRequest = getPayoutRequestOrThrow(requestId);
        if (payoutRequest.getStatus() != PayoutRequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING payout requests can be approved");
        }
        payoutRequest.setStatus(PayoutRequestStatus.APPROVED);
        payoutRequest.setProcessedByAdminId(adminId);
        return toPayoutRequestResponse(payoutRequestRepository.save(payoutRequest));
    }

    @Override
    @Transactional
    public PayoutRequestResponse rejectPayoutRequest(UUID adminId, UUID requestId, String reason) {
        PayoutRequest payoutRequest = getPayoutRequestOrThrow(requestId);
        if (payoutRequest.getStatus() == PayoutRequestStatus.COMPLETED
                || payoutRequest.getStatus() == PayoutRequestStatus.PROCESSING
                || payoutRequest.getStatus() == PayoutRequestStatus.REJECTED) {
            throw new BadRequestException("This payout request cannot be rejected");
        }

        MerchantWallet wallet = getOrCreateWalletForUpdate(payoutRequest.getMerchantId(), null);
        wallet.setAvailableBalance(wallet.getAvailableBalance() + payoutRequest.getAmount());
        wallet.setPendingWithdrawal(wallet.getPendingWithdrawal() - payoutRequest.getAmount());
        walletRepository.save(wallet);

        WalletTransaction transaction = payoutRequest.getWalletTransaction();
        if (transaction != null) {
            transaction.setStatus(WalletTransactionStatus.REJECTED);
            transaction.setDescription("Withdrawal rejected: " + reason);
            transactionRepository.save(transaction);
        }

        payoutRequest.setStatus(PayoutRequestStatus.REJECTED);
        payoutRequest.setRejectionReason(reason);
        payoutRequest.setProcessedByAdminId(adminId);
        payoutRequest.setProcessedAt(Instant.now());
        return toPayoutRequestResponse(payoutRequestRepository.save(payoutRequest));
    }

    @Override
    @Transactional
    public PayoutBatchResponse createPayoutBatch(UUID adminId, CreatePayoutBatchRequest request) {
        List<UUID> ids = request.getPayoutRequestIds();
        List<PayoutRequest> payoutRequests = payoutRequestRepository.findByIdIn(ids);
        validateBatchInput(ids, payoutRequests);

        if (!payOSProperties.isPayoutDryRun()) {
            ensureLivePayoutReady();
        }

        Long totalAmount =
                payoutRequests.stream().mapToLong(PayoutRequest::getAmount).sum();
        PayoutBatch batch = payoutBatchRepository.save(PayoutBatch.builder()
                .status(PayoutBatchStatus.PROCESSING)
                .totalAmount(totalAmount)
                .itemCount(payoutRequests.size())
                .requestedByAdminId(adminId)
                .providerReferenceId("payout_batch_" + UUID.randomUUID())
                .build());

        payoutRequests.forEach(payoutRequest -> {
            payoutRequest.setStatus(PayoutRequestStatus.PROCESSING);
            payoutRequest.setPayoutBatch(batch);
            payoutRequest.setProcessedByAdminId(adminId);
            if (payoutRequest.getWalletTransaction() != null) {
                payoutRequest.getWalletTransaction().setStatus(WalletTransactionStatus.PENDING);
            }
        });
        payoutRequestRepository.saveAll(payoutRequests);

        if (payOSProperties.isPayoutDryRun()) {
            completeBatch(batch, payoutRequests, DRY_RUN_PROVIDER, "dry_run:" + batch.getId(), null);
            return toPayoutBatchResponse(payoutBatchRepository.save(batch));
        }

        try {
            Payout payout = payOSPayout.payouts().batch().create(toPayOSBatchRequest(batch, payoutRequests));
            completeBatch(batch, payoutRequests, PAYOS_PROVIDER, payout.getId(), toJson(payout));
        } catch (Exception ex) {
            log.error("PayOS payout batch failed: batchId={}", batch.getId(), ex);
            failBatch(batch, payoutRequests, ex.getMessage());
        }
        return toPayoutBatchResponse(payoutBatchRepository.save(batch));
    }

    @Override
    @Transactional
    public PayoutRequestResponse retryPayoutRequest(UUID adminId, UUID requestId) {
        PayoutRequest payoutRequest = getPayoutRequestOrThrow(requestId);
        if (payoutRequest.getStatus() != PayoutRequestStatus.FAILED) {
            throw new BadRequestException("Only FAILED payout requests can be retried");
        }
        payoutRequest.setStatus(PayoutRequestStatus.APPROVED);
        if (payoutRequest.getWalletTransaction() != null) {
            payoutRequest.getWalletTransaction().setStatus(WalletTransactionStatus.PENDING);
        }
        payoutRequestRepository.save(payoutRequest);

        CreatePayoutBatchRequest retryRequest = new CreatePayoutBatchRequest();
        retryRequest.setPayoutRequestIds(List.of(requestId));
        createPayoutBatch(adminId, retryRequest);
        return toPayoutRequestResponse(getPayoutRequestOrThrow(requestId));
    }

    @Override
    public PayoutAccountBalanceResponse getPayoutAccountBalance() {
        if (payOSProperties.isPayoutDryRun()) {
            return PayoutAccountBalanceResponse.builder()
                    .dryRun(true)
                    .enabled(payOSProperties.isPayoutEnabled())
                    .currency("VND")
                    .balance("DRY_RUN")
                    .build();
        }
        ensureLivePayoutReady();
        PayoutAccountInfo accountInfo = payOSPayout.payoutsAccount().balance();
        return PayoutAccountBalanceResponse.builder()
                .dryRun(false)
                .enabled(true)
                .accountNumber(accountInfo.getAccountNumber())
                .accountName(accountInfo.getAccountName())
                .currency(accountInfo.getCurrency())
                .balance(accountInfo.getBalance())
                .build();
    }

    @Override
    @Transactional
    public void creditMerchantRevenue(MerchantRevenueEvent event) {
        if (event.getMerchantId() == null || event.getOrderId() == null || event.getAmount() == null) {
            throw new BadRequestException("Invalid merchant revenue event");
        }

        String referenceKey =
                event.getIdempotencyKey() != null && !event.getIdempotencyKey().isBlank()
                        ? event.getIdempotencyKey()
                        : "order:" + event.getOrderId() + ":merchant-revenue";
        if (transactionRepository.findByReferenceKey(referenceKey).isPresent()) {
            log.info("Skip duplicated merchant revenue event: referenceKey={}", referenceKey);
            return;
        }

        MerchantWallet wallet = getOrCreateWalletForUpdate(event.getMerchantId(), event.getRestaurantId());
        if (wallet.getRestaurantId() == null) {
            wallet.setRestaurantId(event.getRestaurantId());
        }
        wallet.setAvailableBalance(wallet.getAvailableBalance() + event.getAmount());
        wallet.setTotalEarned(wallet.getTotalEarned() + event.getAmount());
        walletRepository.save(wallet);

        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .merchantId(event.getMerchantId())
                .restaurantId(event.getRestaurantId())
                .orderId(event.getOrderId())
                .type(WalletTransactionType.EARN)
                .status(WalletTransactionStatus.COMPLETED)
                .amount(event.getAmount())
                .description("Revenue from completed order " + event.getOrderId())
                .referenceKey(referenceKey)
                .build();
        transactionRepository.save(transaction);
    }

    private MerchantWallet getOrCreateWalletForUpdate(UUID merchantId, UUID restaurantId) {
        return walletRepository
                .findByMerchantIdForUpdate(merchantId)
                .orElseGet(() -> walletRepository.save(MerchantWallet.builder()
                        .merchantId(merchantId)
                        .restaurantId(restaurantId)
                        .availableBalance(0L)
                        .pendingWithdrawal(0L)
                        .totalEarned(0L)
                        .totalWithdrawn(0L)
                        .build()));
    }

    private void clearDefaultBankAccount(UUID merchantId) {
        List<MerchantBankAccount> accounts =
                bankAccountRepository.findByMerchantIdAndActiveTrueOrderByDefaultAccountDescCreatedAtDesc(merchantId);
        accounts.forEach(account -> account.setDefaultAccount(false));
        bankAccountRepository.saveAll(accounts);
    }

    private void validateBatchInput(List<UUID> ids, List<PayoutRequest> payoutRequests) {
        Set<UUID> uniqueIds = new HashSet<>(ids);
        if (uniqueIds.size() != ids.size() || payoutRequests.size() != uniqueIds.size()) {
            throw new BadRequestException("Invalid payout request list");
        }
        payoutRequests.forEach(payoutRequest -> {
            if (payoutRequest.getStatus() != PayoutRequestStatus.APPROVED) {
                throw new BadRequestException("Only APPROVED payout requests can be batched");
            }
        });
    }

    private void ensureLivePayoutReady() {
        if (!payOSProperties.isPayoutEnabled()) {
            throw new BadRequestException(
                    "Live payout is disabled. Set PAYOS_PAYOUT_ENABLED=true to use PayOS payout.");
        }
        if (!payOSProperties.hasPayoutCredentials()) {
            throw new BadRequestException("PayOS payout credentials are missing");
        }
    }

    private PayoutBatchRequest toPayOSBatchRequest(PayoutBatch batch, List<PayoutRequest> payoutRequests) {
        List<PayoutBatchItem> items = payoutRequests.stream()
                .map(payoutRequest -> PayoutBatchItem.builder()
                        .referenceId("payout_request_" + payoutRequest.getId())
                        .amount(payoutRequest.getAmount())
                        .description("Merchant payout " + payoutRequest.getId())
                        .toBin(payoutRequest.getBankBin())
                        .toAccountNumber(payoutRequest.getAccountNumber())
                        .build())
                .toList();

        return PayoutBatchRequest.builder()
                .referenceId(batch.getProviderReferenceId())
                .validateDestination(true)
                .category(List.of("merchant_payout"))
                .payouts(items)
                .build();
    }

    private void completeBatch(
            PayoutBatch batch,
            List<PayoutRequest> payoutRequests,
            String provider,
            String providerPayoutId,
            String providerResponseJson) {
        batch.setStatus(PayoutBatchStatus.COMPLETED);
        batch.setProviderBatchId(providerPayoutId);
        batch.setProviderResponseJson(providerResponseJson);
        batch.setCompletedAt(Instant.now());

        payoutRequests.forEach(payoutRequest -> {
            MerchantWallet wallet = getOrCreateWalletForUpdate(payoutRequest.getMerchantId(), null);
            wallet.setPendingWithdrawal(wallet.getPendingWithdrawal() - payoutRequest.getAmount());
            wallet.setTotalWithdrawn(wallet.getTotalWithdrawn() + payoutRequest.getAmount());
            walletRepository.save(wallet);

            WalletTransaction transaction = payoutRequest.getWalletTransaction();
            if (transaction != null) {
                transaction.setStatus(WalletTransactionStatus.COMPLETED);
                transaction.setDescription("Withdrawal completed");
                transactionRepository.save(transaction);
            }

            payoutRequest.setStatus(PayoutRequestStatus.COMPLETED);
            payoutRequest.setProvider(provider);
            payoutRequest.setProviderPayoutId(providerPayoutId);
            payoutRequest.setProviderReferenceId("payout_request_" + payoutRequest.getId());
            payoutRequest.setProviderResponseJson(providerResponseJson);
            payoutRequest.setProcessedAt(Instant.now());
        });
        payoutRequestRepository.saveAll(payoutRequests);
    }

    private void failBatch(PayoutBatch batch, List<PayoutRequest> payoutRequests, String errorMessage) {
        String errorJson = "{\"error\":\"" + sanitizeJson(errorMessage) + "\"}";
        batch.setStatus(PayoutBatchStatus.FAILED);
        batch.setProviderResponseJson(errorJson);
        batch.setCompletedAt(Instant.now());

        payoutRequests.forEach(payoutRequest -> {
            WalletTransaction transaction = payoutRequest.getWalletTransaction();
            if (transaction != null) {
                transaction.setStatus(WalletTransactionStatus.FAILED);
                transaction.setDescription("Withdrawal failed: " + errorMessage);
                transactionRepository.save(transaction);
            }
            payoutRequest.setStatus(PayoutRequestStatus.FAILED);
            payoutRequest.setProvider(PAYOS_PROVIDER);
            payoutRequest.setProviderResponseJson(errorJson);
            payoutRequest.setProcessedAt(Instant.now());
        });
        payoutRequestRepository.saveAll(payoutRequests);
    }

    private PayoutRequest getPayoutRequestOrThrow(UUID requestId) {
        return payoutRequestRepository
                .findById(requestId)
                .orElseThrow(() -> new NotFoundException("Payout request not found"));
    }

    private PaginationResponse toPagination(Page<?> page) {
        return PaginationResponse.builder()
                .page(page.getNumber() + 1)
                .limit(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            return String.valueOf(value);
        }
    }

    private String sanitizeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private WalletSummaryResponse toWalletSummary(MerchantWallet wallet, BankAccountResponse defaultBankAccount) {
        Long availableBalance = wallet.getAvailableBalance() == null ? 0L : wallet.getAvailableBalance();
        Long pendingWithdrawal = wallet.getPendingWithdrawal() == null ? 0L : wallet.getPendingWithdrawal();
        Long totalEarned = wallet.getTotalEarned() == null ? 0L : wallet.getTotalEarned();
        Long totalWithdrawn = wallet.getTotalWithdrawn() == null ? 0L : wallet.getTotalWithdrawn();
        return WalletSummaryResponse.builder()
                .id(wallet.getId())
                .merchantId(wallet.getMerchantId())
                .restaurantId(wallet.getRestaurantId())
                .availableBalance(availableBalance)
                .pendingWithdrawal(pendingWithdrawal)
                .totalEarned(totalEarned)
                .totalWithdrawn(totalWithdrawn)
                .balance(availableBalance)
                .defaultBankAccount(defaultBankAccount)
                .build();
    }

    private BankAccountResponse toBankAccountResponse(MerchantBankAccount bankAccount) {
        return BankAccountResponse.builder()
                .id(bankAccount.getId())
                .bankName(bankAccount.getBankName())
                .bankBin(bankAccount.getBankBin())
                .accountNumber(bankAccount.getAccountNumber())
                .accountHolderName(bankAccount.getAccountHolderName())
                .defaultAccount(Boolean.TRUE.equals(bankAccount.getDefaultAccount()))
                .active(Boolean.TRUE.equals(bankAccount.getActive()))
                .createdAt(bankAccount.getCreatedAt())
                .updatedAt(bankAccount.getUpdatedAt())
                .build();
    }

    private WalletTransactionResponse toWalletTransactionResponse(WalletTransaction transaction) {
        return WalletTransactionResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .status(transaction.getStatus())
                .description(transaction.getDescription())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private PayoutRequestResponse toPayoutRequestResponse(PayoutRequest payoutRequest) {
        return PayoutRequestResponse.builder()
                .id(payoutRequest.getId())
                .walletId(payoutRequest.getWallet().getId())
                .merchantId(payoutRequest.getMerchantId())
                .amount(payoutRequest.getAmount())
                .bankInfo(BankInfoResponse.builder()
                        .bankName(payoutRequest.getBankName())
                        .bankBin(payoutRequest.getBankBin())
                        .accountNumber(payoutRequest.getAccountNumber())
                        .accountHolderName(payoutRequest.getAccountHolderName())
                        .build())
                .note(payoutRequest.getNote())
                .status(payoutRequest.getStatus())
                .rejectionReason(payoutRequest.getRejectionReason())
                .processedByAdminId(payoutRequest.getProcessedByAdminId())
                .provider(payoutRequest.getProvider())
                .providerReferenceId(payoutRequest.getProviderReferenceId())
                .providerPayoutId(payoutRequest.getProviderPayoutId())
                .payoutBatchId(
                        payoutRequest.getPayoutBatch() == null
                                ? null
                                : payoutRequest.getPayoutBatch().getId())
                .processedAt(payoutRequest.getProcessedAt())
                .createdAt(payoutRequest.getCreatedAt())
                .updatedAt(payoutRequest.getUpdatedAt())
                .build();
    }

    private PayoutBatchResponse toPayoutBatchResponse(PayoutBatch batch) {
        return PayoutBatchResponse.builder()
                .id(batch.getId())
                .status(batch.getStatus())
                .totalAmount(batch.getTotalAmount())
                .itemCount(batch.getItemCount())
                .requestedByAdminId(batch.getRequestedByAdminId())
                .providerBatchId(batch.getProviderBatchId())
                .providerReferenceId(batch.getProviderReferenceId())
                .createdAt(batch.getCreatedAt())
                .completedAt(batch.getCompletedAt())
                .build();
    }
}
