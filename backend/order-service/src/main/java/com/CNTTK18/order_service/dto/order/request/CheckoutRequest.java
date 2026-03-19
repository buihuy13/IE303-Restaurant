package com.CNTTK18.order_service.dto.order.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotEmpty(message = "At least one restaurant must be selected for checkout")
    private List<UUID> restaurantIds;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    private String note;
}
