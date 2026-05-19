package com.CNTTK18.order_service.dto.order.request;

import jakarta.validation.constraints.NotBlank;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class CancelOrderRequest {
    @Schema(description = "Reason for cancelling the order", example = "I want to change my mind")
    @NotBlank(message = "Cancel reason is required")
    private String reason;
}
