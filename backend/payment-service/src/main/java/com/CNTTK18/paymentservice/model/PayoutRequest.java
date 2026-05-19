package com.CNTTK18.paymentservice.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.CNTTK18.paymentservice.model.data.PayoutRequestStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payout_requests")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayoutRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wallet_id", nullable = false)
    private MerchantWallet wallet;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(name = "bank_bin", nullable = false, length = 32)
    private String bankBin;

    @Column(name = "account_number", nullable = false)
    private String accountNumber;

    @Column(name = "account_holder_name", nullable = false)
    private String accountHolderName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PayoutRequestStatus status;

    @Column(name = "note")
    private String note;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "processed_by_admin_id")
    private UUID processedByAdminId;

    @Column(name = "provider")
    private String provider;

    @Column(name = "provider_reference_id")
    private String providerReferenceId;

    @Column(name = "provider_payout_id")
    private String providerPayoutId;

    @Lob
    @Column(name = "provider_response_json", columnDefinition = "TEXT")
    private String providerResponseJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payout_batch_id")
    private PayoutBatch payoutBatch;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_transaction_id")
    private WalletTransaction walletTransaction;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "processed_at")
    private Instant processedAt;
}
