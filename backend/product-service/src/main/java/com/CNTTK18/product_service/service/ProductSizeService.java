package com.CNTTK18.product_service.service;

import java.util.UUID;

import com.CNTTK18.product_service.dto.productSize.request.ProductSizeCreate;
import com.CNTTK18.product_service.dto.productSize.request.ProductSizeRequest;
import com.CNTTK18.product_service.dto.productSize.response.ProductSizeResponse;

public interface ProductSizeService {
    ProductSizeResponse getProductSizeById(UUID id);

    ProductSizeResponse updateProductSize(UUID id, ProductSizeRequest request);

    ProductSizeResponse createProductSize(ProductSizeCreate productSize);

    void deleteProductSize(UUID id);
}
