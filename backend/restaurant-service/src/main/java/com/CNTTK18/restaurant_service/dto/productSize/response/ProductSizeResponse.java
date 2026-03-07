package com.CNTTK18.restaurant_service.dto.productSize.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductSizeResponse {
    private String id;
    private String sizeName;
    private BigDecimal price;
    private String sizeId;
}
