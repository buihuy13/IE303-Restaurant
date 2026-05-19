package com.CNTTK18.paymentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Data
public class BankAccountRequest {
    @NotBlank
    @Size(max = 120)
    private String bankName;

    @NotBlank
    @Size(max = 32)
    private String bankBin;

    @NotBlank
    @Size(max = 64)
    private String accountNumber;

    @NotBlank
    @Size(max = 120)
    private String accountHolderName;

    private Boolean defaultAccount;
}
