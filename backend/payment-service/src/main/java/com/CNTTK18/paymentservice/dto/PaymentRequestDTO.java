package com.CNTTK18.paymentservice.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {
    @NotNull(message = "orderId is required")
    private UUID orderId;

    @NotNull(message = "userId is required")
    private UUID userId;

    @NotNull(message = "amount is required")
    @Positive(message = "amount must be greater than 0")
    private Integer amount; // PayOS nhận amount dạng số nguyên
    private String description;
    private String cancelUrl;
    private String returnUrl;
}
