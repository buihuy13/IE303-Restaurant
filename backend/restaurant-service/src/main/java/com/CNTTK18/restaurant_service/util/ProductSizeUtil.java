package com.CNTTK18.restaurant_service.util;

import com.CNTTK18.restaurant_service.dto.productSize.response.ProductSizeResponse;
import com.CNTTK18.restaurant_service.model.ProductSize;

public class ProductSizeUtil {
    public static ProductSizeResponse mapProductSizeToProductSizeResponse(ProductSize productSize) {
        return ProductSizeResponse.builder()
                .id(productSize.getId())
                .sizeName(productSize.getSize().getName())
                .price(productSize.getPrice())
                .sizeId(productSize.getSize().getId())
                .build();
    }
}
