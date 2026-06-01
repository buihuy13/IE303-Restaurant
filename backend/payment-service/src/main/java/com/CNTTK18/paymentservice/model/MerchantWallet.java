package com.CNTTK18.paymentservice.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "merchant_wallets",
        uniqueConstraints = @UniqueConstraint(name = "uk_merchant_wallets_merchant_id", columnNames = "merchant_id"))
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MerchantWallet {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(name = "restaurant_id")
    private UUID restaurantId;

    @Column(name = "available_balance", nullable = false)
    private Long availableBalance;

    @Column(name = "pending_withdrawal", nullable = false)
    private Long pendingWithdrawal;

    @Column(name = "total_earned", nullable = false)
    private Long totalEarned;

    @Column(name = "total_withdrawn", nullable = false)
    private Long totalWithdrawn;

    @Version
    private Long version;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        if (availableBalance == null) availableBalance = 0L;
        if (pendingWithdrawal == null) pendingWithdrawal = 0L;
        if (totalEarned == null) totalEarned = 0L;
        if (totalWithdrawn == null) totalWithdrawn = 0L;
    }
}
