package com.CNTTK18.order_service.dto.order.response;

import java.math.BigDecimal;
import java.time.Instant;
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
public class OrderSummaryDTO {
    private UUID id;
    private Long orderCode;
    private UUID userId;
    private UUID restaurantId;
    private String restaurantName;
    private BigDecimal totalPrice;
    private String cancelReason;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private Instant createdAt;
    private int itemCount;
}
