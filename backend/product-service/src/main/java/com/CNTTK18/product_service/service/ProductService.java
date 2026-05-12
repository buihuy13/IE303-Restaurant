package com.CNTTK18.product_service.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.product_service.dto.UserRole;
import com.CNTTK18.product_service.dto.product.request.ProductRequest;
import com.CNTTK18.product_service.dto.product.request.UpdateProduct;
import com.CNTTK18.product_service.dto.product.response.ProductResponse;
import com.CNTTK18.product_service.client.feign.dto.RestaurantExistsResponse;
import com.CNTTK18.product_service.model.ProductSize;

public interface ProductService {
    ProductResponse getProductById(UUID id);

    ProductResponse getProductBySlug(String slug);

    RestaurantExistsResponse getRestaurantByProductId(UUID productId);

    ProductResponse createProduct(ProductRequest productRequest, MultipartFile imageFile);

    ProductResponse updateProduct(UpdateProduct updateProduct, UUID id, MultipartFile imageFile, UserRole authUser);

    void deleteProduct(UUID id, UserRole authUser);

    void changeProductAvailability(UUID id, UserRole authUser);

    void deleteImage(UUID productId, UserRole authUser);

    Set<ProductSize> getAllProductSizeOfProduct(UUID id);

    List<ProductResponse> getAllProductsByRestaurantId(UUID id);
}
