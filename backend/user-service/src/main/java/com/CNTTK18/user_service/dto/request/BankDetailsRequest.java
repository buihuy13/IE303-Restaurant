package com.CNTTK18.user_service.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BankDetailsRequest {
    @NotBlank(message = "Bank number is mandatory")
    private String bankNumber;

    @NotBlank(message = "Bank code is mandatory")
    private String bank;
}
