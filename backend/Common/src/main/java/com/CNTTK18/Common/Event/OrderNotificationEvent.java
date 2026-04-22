package com.CNTTK18.Common.Event;

import java.math.BigDecimal;
import java.util.UUID;

public class OrderNotificationEvent {
    private UUID       orderId;
    private UUID       userId;
    private String     userEmail;
    private String     restaurantName;
    private BigDecimal totalPrice;
    private String     status;
    private String     deliveryAddress;

    public OrderNotificationEvent() {}

    public OrderNotificationEvent(UUID orderId, UUID userId, String userEmail,
            String restaurantName, BigDecimal totalPrice,
            String status, String deliveryAddress) {
        this.orderId         = orderId;
        this.userId          = userId;
        this.userEmail       = userEmail;
        this.restaurantName  = restaurantName;
        this.totalPrice      = totalPrice;
        this.status          = status;
        this.deliveryAddress = deliveryAddress;
    }

    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
}
