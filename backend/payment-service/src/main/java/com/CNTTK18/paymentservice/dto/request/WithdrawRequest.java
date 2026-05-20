package com.CNTTK18.paymentservice.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Data
public class WithdrawRequest {
    @NotNull
    @Min(1)
    private Long amount;

    @NotNull
    private UUID bankAccountId;

    @Size(max = 255)
    private String note;
}
