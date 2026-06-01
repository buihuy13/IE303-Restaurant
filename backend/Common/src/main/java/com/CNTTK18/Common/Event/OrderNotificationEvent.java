package com.CNTTK18.Common.Event;

import java.math.BigDecimal;
import java.util.UUID;

public class OrderNotificationEvent {
    public static final String EVENT_TYPE_ORDER_STATUS = "ORDER_STATUS";
    public static final String EVENT_TYPE_PAYMENT_STATUS = "PAYMENT_STATUS";

    private UUID orderId;
    private UUID userId;
    private UUID merchantId;
    private String userEmail;
    private String restaurantName;
    private BigDecimal totalPrice;
    private String status;
    private String deliveryAddress;
    private String eventType;
    private String orderStatus;
    private String paymentStatus;

    public OrderNotificationEvent() {}

    public OrderNotificationEvent(
            UUID orderId,
            UUID userId,
            UUID merchantId,
            String userEmail,
            String restaurantName,
            BigDecimal totalPrice,
            String status,
            String deliveryAddress) {
        this(
                orderId,
                userId,
                merchantId,
                userEmail,
                restaurantName,
                totalPrice,
                status,
                deliveryAddress,
                null,
                null,
                null);
    }

    public OrderNotificationEvent(
            UUID orderId,
            UUID userId,
            UUID merchantId,
            String userEmail,
            String restaurantName,
            BigDecimal totalPrice,
            String status,
            String deliveryAddress,
            String eventType,
            String orderStatus,
            String paymentStatus) {
        this.orderId = orderId;
        this.userId = userId;
        this.merchantId = merchantId;
        this.userEmail = userEmail;
        this.restaurantName = restaurantName;
        this.totalPrice = totalPrice;
        this.status = status;
        this.deliveryAddress = deliveryAddress;
        this.eventType = eventType;
        this.orderStatus = orderStatus;
        this.paymentStatus = paymentStatus;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(UUID merchantId) {
        this.merchantId = merchantId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}
