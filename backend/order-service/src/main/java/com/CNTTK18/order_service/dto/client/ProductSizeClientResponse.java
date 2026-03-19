package com.CNTTK18.order_service.dto.client;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.Data;

@Data
public class ProductSizeClientResponse {
    private UUID id;
    private String sizeName;
    private BigDecimal price;
    private ProductClientResponse product;
}
