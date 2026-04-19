package com.CNTTK18.dashboard_service.dto.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.CNTTK18.dashboard_service.model.OrderStatus;
import com.CNTTK18.dashboard_service.model.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {
    private UUID id;
    private UUID userId;
    private UUID restaurantId;
    private String restaurantName;
    private List<OrderItemResponse> items;
    private BigDecimal totalPrice;
    private String deliveryAddress;
    private String note;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private Long orderCode;
    private Instant createdAt;
    private Instant updatedAt;
}
