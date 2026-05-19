package com.CNTTK18.order_service.dto.order.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.CNTTK18.order_service.model.data.OrderStatus;
import com.CNTTK18.order_service.model.data.PaymentStatus;

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
    private String cancelReason;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private Long orderCode;
    private Instant createdAt;
    private Instant updatedAt;
}
