package com.CNTTK18.restaurant_service.dto.product.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProductQuery {
    private String rating;
    private String category;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String search;
    private Integer nearby;

    @NotNull
    private Double lat;

    @NotNull
    private Double lon;

    private String locationsorted;
}
