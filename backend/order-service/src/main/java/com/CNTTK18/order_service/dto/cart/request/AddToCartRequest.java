package com.CNTTK18.order_service.dto.cart.request;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class AddToCartRequest {
    @NotNull(message = "Restaurant ID is required")
    private UUID restaurantId;

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Product Size ID is required")
    private UUID productSizeId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;
}
