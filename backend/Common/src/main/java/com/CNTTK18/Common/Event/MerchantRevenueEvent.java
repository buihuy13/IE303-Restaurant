package com.CNTTK18.Common.Event;

import java.time.Instant;
import java.util.UUID;

public class MerchantRevenueEvent {
    private UUID orderId;
    private UUID merchantId;
    private UUID restaurantId;
    private Long amount;
    private Instant completedAt;
    private String idempotencyKey;

    public MerchantRevenueEvent() {}

    public MerchantRevenueEvent(
            UUID orderId, UUID merchantId, UUID restaurantId, Long amount, Instant completedAt, String idempotencyKey) {
        this.orderId = orderId;
        this.merchantId = merchantId;
        this.restaurantId = restaurantId;
        this.amount = amount;
        this.completedAt = completedAt;
        this.idempotencyKey = idempotencyKey;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public UUID getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(UUID merchantId) {
        this.merchantId = merchantId;
    }

    public UUID getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(UUID restaurantId) {
        this.restaurantId = restaurantId;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
}
