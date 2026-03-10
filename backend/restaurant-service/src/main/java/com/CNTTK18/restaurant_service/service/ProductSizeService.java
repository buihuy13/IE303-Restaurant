package com.CNTTK18.restaurant_service.service;

import java.util.UUID;

import com.CNTTK18.restaurant_service.dto.productSize.request.ProductSizeCreate;
import com.CNTTK18.restaurant_service.dto.productSize.request.ProductSizeRequest;
import com.CNTTK18.restaurant_service.dto.productSize.response.ProductSizeResponse;

public interface ProductSizeService {
    public ProductSizeResponse getProductSizeById(UUID id);

    public ProductSizeResponse updateProductSize(UUID id, ProductSizeRequest request);

    public ProductSizeResponse createProductSize(ProductSizeCreate productSize);

    public void deleteProductSize(UUID id);
}
