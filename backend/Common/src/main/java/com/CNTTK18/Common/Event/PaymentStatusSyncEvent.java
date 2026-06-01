package com.CNTTK18.Common.Event;

import java.util.UUID;

public class PaymentStatusSyncEvent {
    private UUID orderId;
    private boolean success;
    private Long orderCode;
    private String paymentLinkId;

    public PaymentStatusSyncEvent() {}

    public PaymentStatusSyncEvent(UUID orderId, boolean success, Long orderCode, String paymentLinkId) {
        this.orderId = orderId;
        this.success = success;
        this.orderCode = orderCode;
        this.paymentLinkId = paymentLinkId;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public Long getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(Long orderCode) {
        this.orderCode = orderCode;
    }

    public String getPaymentLinkId() {
        return paymentLinkId;
    }

    public void setPaymentLinkId(String paymentLinkId) {
        this.paymentLinkId = paymentLinkId;
    }
}
