package com.CNTTK18.order_service.model;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CartItem {
    private UUID productId;
    private UUID productSizeId;
    private String productName;
    private String sizeName;
    private BigDecimal price;
    private int quantity;
    private String imageUrl;
}
