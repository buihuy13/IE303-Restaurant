package com.CNTTK18.user_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request body for merchant registration.
 * Contains both account credentials and restaurant information.
 * Replaces the localStorage workaround in the frontend.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MerchantRegisterRequest {

    // ---- Account credentials ----
    @NotBlank(message = "Username is required")
    private String username;

    @Email
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Confirm Password is required")
    private String confirmPassword;

    @NotBlank(message = "Phone number is required")
    private String phone;

    // ---- Restaurant info ----
    @NotBlank(message = "Restaurant name is required")
    private String resName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String openingTime;

    private String closingTime;
}
