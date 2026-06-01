package com.CNTTK18.restaurant_service.dto.restaurant.request;

import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UpdateRes {
    @NotBlank(message = "Restaurant name is required")
    @Size(max = 100)
    private String resName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull
    private double longitude;

    @NotNull
    private double latitude;

    @NotNull(message = "Opening time is required")
    private LocalTime openingTime;

    @NotNull(message = "Closing time is required")
    private LocalTime closingTime;

    @NotBlank(message = "Phone number is required")
    @Size(max = 12)
    private String phone;
}
