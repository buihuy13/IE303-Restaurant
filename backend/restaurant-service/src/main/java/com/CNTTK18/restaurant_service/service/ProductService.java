package com.CNTTK18.restaurant_service.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.restaurant_service.dto.UserRole;
import com.CNTTK18.restaurant_service.dto.product.request.ProductQuery;
import com.CNTTK18.restaurant_service.dto.product.request.ProductRequest;
import com.CNTTK18.restaurant_service.dto.product.request.UpdateProduct;
import com.CNTTK18.restaurant_service.dto.product.response.ProductResponse;
import com.CNTTK18.restaurant_service.dto.restaurant.request.Coordinates;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponse;
import com.CNTTK18.restaurant_service.model.ProductSize;

public interface ProductService {
    public Page<ProductResponse> getAllProducts(ProductQuery productQuery, Coordinates location, Pageable pageable);

    public ProductResponse getProductById(UUID id);

    public ProductResponse getProductBySlug(String slug);

    public ProductResponse createProduct(ProductRequest productRequest, MultipartFile imageFile);

    public ProductResponse updateProduct(
            UpdateProduct updateProduct, UUID id, MultipartFile imageFile, UserRole authUser);

    public void deleteProduct(UUID id, UserRole authUser);

    public void changeProductAvailability(UUID id, UserRole authUser);

    public void deleteImage(UUID productId, UserRole authUser);

    public Set<ProductSize> getAllProductSizeOfProduct(UUID id);

    public List<ProductResponse> getAllProductsByRestaurantId(UUID id);

    public ResResponse getRestaurantByProductId(UUID id);
}
