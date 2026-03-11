package com.CNTTK18.restaurant_service.dto.cate.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CateRequest {
    @NotBlank(message = "cateName is required")
    @Size(max = 100)
    private String cateName;
}
