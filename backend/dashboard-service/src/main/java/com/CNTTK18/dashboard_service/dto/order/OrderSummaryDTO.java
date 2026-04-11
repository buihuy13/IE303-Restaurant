package com.CNTTK18.dashboard_service.dto.order;

import java.math.BigDecimal;
import java.time.Instant;
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
public class OrderSummaryDTO {
    private UUID id;
    private Long orderCode;
    private UUID userId;
    private UUID restaurantId;
    private String restaurantName;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private Instant createdAt;
    private int itemCount;
}
