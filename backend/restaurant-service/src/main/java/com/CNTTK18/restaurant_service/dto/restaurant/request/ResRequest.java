package com.CNTTK18.restaurant_service.dto.restaurant.request;

import java.time.LocalTime;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResRequest {
    @NotBlank(message = "Restaurant name is required")
    @Size(max = 100)
    private String resName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull
    private double longitude;

    @NotNull
    private double latitude;

    private float rating;

    @NotNull(message = "Opening time is required")
    private LocalTime openingTime;

    @NotNull(message = "Closing time is required")
    private LocalTime closingTime;

    @NotBlank(message = "Phone number is required")
    @Size(max = 12)
    private String phone;

    @NotNull(message = "Merchant Id is required")
    private UUID merchantId;
}
