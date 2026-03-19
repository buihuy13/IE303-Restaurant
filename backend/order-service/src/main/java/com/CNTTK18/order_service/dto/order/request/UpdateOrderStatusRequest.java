package com.CNTTK18.order_service.dto.order.request;

import com.CNTTK18.order_service.model.data.OrderStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {
    @NotNull(message = "Status cannot be null")
    private OrderStatus status;
}
