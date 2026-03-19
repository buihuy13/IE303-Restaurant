package com.CNTTK18.order_service.dto.cart.request;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class UpdateCartItemRequest {
    @NotNull(message = "Product Size ID is required")
    private UUID productSizeId;

    @Min(value = 0, message = "Quantity cannot be negative")
    private int quantity;
}
