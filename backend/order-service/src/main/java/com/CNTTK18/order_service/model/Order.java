package com.CNTTK18.order_service.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.CNTTK18.order_service.model.data.OrderStatus;
import com.CNTTK18.order_service.model.data.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "orders")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}")
@CompoundIndex(name = "res_created_idx", def = "{'restaurantId': 1, 'createdAt': -1}")
public class Order {
    @Id
    private UUID id;

    @Indexed
    private UUID userId;

    @Indexed
    private UUID restaurantId;

    private String restaurantName;

    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    private BigDecimal totalPrice;
    private String deliveryAddress;
    private String note;

    @Indexed
    private OrderStatus status;

    private PaymentStatus paymentStatus;

    @Indexed(unique = true, sparse = true)
    private Long orderCode;

    private String paymentLinkId;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
