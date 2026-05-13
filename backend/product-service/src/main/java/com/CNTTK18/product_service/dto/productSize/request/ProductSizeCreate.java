package com.CNTTK18.product_service.dto.productSize.request;

import java.math.BigDecimal;
import java.util.UUID;

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
    @NotNull
    private UUID sizeId;

    @NotNull
    private UUID productId;

    @NotNull
    private BigDecimal price;
}
