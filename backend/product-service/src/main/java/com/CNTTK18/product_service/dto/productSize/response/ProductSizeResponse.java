package com.CNTTK18.product_service.dto.productSize.response;

import java.math.BigDecimal;
import java.util.UUID;

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
    private UUID id;
    private UUID sizeId;
    private String sizeName;
    private BigDecimal price;
}
