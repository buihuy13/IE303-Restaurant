package com.CNTTK18.paymentservice.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {
    private UUID userId;
    private Integer amount; // PayOS nhận amount dạng số nguyên
    private String description;
    private String cancelUrl;
    private String returnUrl;
}
