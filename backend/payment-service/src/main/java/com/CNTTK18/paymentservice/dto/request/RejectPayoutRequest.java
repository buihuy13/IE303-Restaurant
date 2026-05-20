package com.CNTTK18.paymentservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Data
public class RejectPayoutRequest {
    @NotBlank
    @Size(max = 255)
    private String reason;
}
