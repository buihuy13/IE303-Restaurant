package com.CNTTK18.restaurant_service.dto.productSize.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductSizeCreate {
    @NotBlank
    private String sizeId;

    @NotBlank
    private String productId;

    @NotNull
    private BigDecimal price;
}
