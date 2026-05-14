package com.CNTTK18.product_service.service.Impl;

import java.time.Instant;
import java.util.DoubleSummaryStatistics;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.SlugGenerator;
import com.CNTTK18.product_service.client.feign.CatalogServiceFeignClient;
import com.CNTTK18.product_service.client.feign.ImageServiceFeignClient;
import com.CNTTK18.product_service.client.feign.RestaurantServiceFeignClient;
import com.CNTTK18.product_service.client.feign.dto.CategoryResponse;
import com.CNTTK18.product_service.client.feign.dto.ImageUploadResponse;
import com.CNTTK18.product_service.client.feign.dto.RestaurantExistsResponse;
import com.CNTTK18.product_service.client.feign.dto.SizeResponse;
import com.CNTTK18.product_service.dto.UserRole;
import com.CNTTK18.product_service.dto.product.request.ProductRequest;
import com.CNTTK18.product_service.dto.product.request.SizePrice;
import com.CNTTK18.product_service.dto.product.request.UpdateProduct;
import com.CNTTK18.product_service.dto.product.response.ProductResponse;
import com.CNTTK18.product_service.event.publisher.ProductEventPublisher;
import com.CNTTK18.product_service.exception.InvalidRequestException;
import com.CNTTK18.product_service.mapper.ProductMapper;
import com.CNTTK18.product_service.model.ProductSize;
import com.CNTTK18.product_service.model.Products;
import com.CNTTK18.product_service.repository.ProductRepository;
import com.CNTTK18.product_service.service.ProductService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepo;
    private final CatalogServiceFeignClient catalogServiceClient;
    private final RestaurantServiceFeignClient restaurantServiceClient;
    private final ImageServiceFeignClient imageServiceClient;
    private final ProductMapper productMapper;
    private final ProductEventPublisher eventPublisher;

    @Override
    public ProductResponse getProductById(UUID id) {
        Products product = getById(id);
        return productMapper.toProductResponse(product);
    }

    @Override
    public ProductResponse getProductBySlug(String slug) {
        Products product =
                productRepo.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productMapper.toProductResponse(product);
    }

    @Override
    public RestaurantExistsResponse getRestaurantByProductId(UUID productId) {
        Products product = getById(productId);
        return restaurantServiceClient.getRestaurantById(product.getRestaurantId());
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest productRequest, MultipartFile imageFile) {
        @SuppressWarnings("unused")
        CategoryResponse category = getCategoryResponse(productRequest.getCategoryId());

        @SuppressWarnings("unused")
        RestaurantExistsResponse restaurant =
                restaurantServiceClient.getRestaurantById(productRequest.getRestaurantId());

        Products product = Products.builder()
                .id(UUID.randomUUID())
                .productName(productRequest.getProductName())
                .description(productRequest.getDescription())
                .categoryId(productRequest.getCategoryId())
                .restaurantId(productRequest.getRestaurantId())
                .available(productRequest.isAvailable())
                .slug(SlugGenerator.generate(productRequest.getProductName()))
                .build();

        addProductSizes(product, productRequest.getSizeIds());
        setImageIfPresent(product, imageFile);

        Products savedProduct = productRepo.save(product);

        DoubleSummaryStatistics priceStats = calculatePriceStats(savedProduct);

        // event publisher
        eventPublisher.publishProductCreated(
                savedProduct.getId(),
                savedProduct.getProductName(),
                savedProduct.getRestaurantId(),
                savedProduct.getCategoryId(),
                savedProduct.getSlug(),
                savedProduct.getDescription(),
                savedProduct.isAvailable(),
                priceStats.getMin(),
                priceStats.getMax(),
                savedProduct.getImageURL(),
                savedProduct.getCreatedAt());

        return productMapper.toProductResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(
            UpdateProduct updateProduct, UUID id, MultipartFile imageFile, UserRole authUser) {
        Products product = getById(id);

        @SuppressWarnings("unused")
        CategoryResponse category = getCategoryResponse(updateProduct.getCategoryId());

        if (!product.getProductName().equals(updateProduct.getProductName())) {
            product.setProductName(updateProduct.getProductName());
            product.setSlug(SlugGenerator.generate(updateProduct.getProductName()));
        }

        product.setCategoryId(updateProduct.getCategoryId());
        product.setDescription(updateProduct.getDescription());

        if (updateProduct.getSizeIds() != null) {
            product.clearAllProductSizes();
            for (SizePrice psDto : updateProduct.getSizeIds()) {
                SizeResponse size = catalogServiceClient.getSize(psDto.getSizeId());

                ProductSize productSize = ProductSize.builder()
                        .sizeId(size.getId())
                        .price(psDto.getPrice())
                        .build();

                product.addProductSize(productSize);
            }
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            String oldPublicId = product.getPublicID();
            ImageUploadResponse image = imageServiceClient.uploadImage(imageFile, "product");
            product.setImageURL(image.getUrl());
            product.setPublicID(image.getPublic_id());

            if (oldPublicId != null && !oldPublicId.isEmpty()) {
                imageServiceClient.deleteImage(oldPublicId);
            }
        }

        Products savedProduct = productRepo.save(product);

        DoubleSummaryStatistics priceStats = calculatePriceStats(savedProduct);

        eventPublisher.publishProductUpdated(
                savedProduct.getId(),
                savedProduct.getProductName(),
                savedProduct.getRestaurantId(),
                savedProduct.getCategoryId(),
                savedProduct.getSlug(),
                savedProduct.isAvailable(),
                priceStats.getMin(),
                priceStats.getMax(),
                savedProduct.getImageURL(),
                savedProduct.getRating(),
                savedProduct.getTotalReview(),
                savedProduct.getUpdatedAt());

        return productMapper.toProductResponse(savedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(UUID id, UserRole authUser) {
        Products product = getById(id);

        if (product.getPublicID() != null && !product.getPublicID().isEmpty()) {
            imageServiceClient.deleteImage(product.getPublicID());
        }

        UUID restaurantId = product.getRestaurantId();
        productRepo.delete(product);

        eventPublisher.publishProductDeleted(id, restaurantId, Instant.now());
    }

    @Override
    @Transactional
    public void changeProductAvailability(UUID id, UserRole authUser) {
        Products product = getById(id);
        product.setAvailable(!product.isAvailable());
        Products savedProduct = productRepo.save(product);

        DoubleSummaryStatistics priceStats = calculatePriceStats(savedProduct);

        eventPublisher.publishProductUpdated(
                savedProduct.getId(),
                savedProduct.getProductName(),
                savedProduct.getRestaurantId(),
                savedProduct.getCategoryId(),
                savedProduct.getSlug(),
                savedProduct.isAvailable(),
                priceStats.getMin(),
                priceStats.getMax(),
                savedProduct.getImageURL(),
                savedProduct.getRating(),
                savedProduct.getTotalReview(),
                savedProduct.getUpdatedAt());
    }

    @Override
    @Transactional
    public void deleteImage(UUID productId, UserRole authUser) {
        Products product = getById(productId);
        imageServiceClient.deleteImage(product.getPublicID());
        product.setImageURL(null);
        product.setPublicID(null);
        Products savedProduct = productRepo.save(product);

        DoubleSummaryStatistics priceStats = calculatePriceStats(savedProduct);

        eventPublisher.publishProductUpdated(
                savedProduct.getId(),
                savedProduct.getProductName(),
                savedProduct.getRestaurantId(),
                savedProduct.getCategoryId(),
                savedProduct.getSlug(),
                savedProduct.isAvailable(),
                priceStats.getMin(),
                priceStats.getMax(),
                savedProduct.getImageURL(),
                savedProduct.getRating(),
                savedProduct.getTotalReview(),
                savedProduct.getUpdatedAt());
    }

    @Override
    @Transactional
    public void updateReviewSummary(UUID id, float rating, int totalReview) {
        Products product = getById(id);
        product.setRating(rating);
        product.setTotalReview(totalReview);
        Products savedProduct = productRepo.save(product);

        DoubleSummaryStatistics priceStats = calculatePriceStats(savedProduct);

        eventPublisher.publishProductUpdated(
                savedProduct.getId(),
                savedProduct.getProductName(),
                savedProduct.getRestaurantId(),
                savedProduct.getCategoryId(),
                savedProduct.getSlug(),
                savedProduct.isAvailable(),
                priceStats.getMin(),
                priceStats.getMax(),
                savedProduct.getImageURL(),
                savedProduct.getRating(),
                savedProduct.getTotalReview(),
                savedProduct.getUpdatedAt());
    }

    @Override
    public Set<ProductSize> getAllProductSizeOfProduct(UUID id) {
        Products product = getById(id);
        return product.getProductSizes();
    }

    @Override
    public List<ProductResponse> getAllProductsByRestaurantId(UUID restaurantId) {
        List<Products> products = productRepo.findProductsByRestaurantId(restaurantId);
        return products.stream().map(productMapper::toProductResponse).toList();
    }

    private void addProductSizes(Products product, List<SizePrice> sizePrices) {
        if (sizePrices == null || sizePrices.isEmpty()) {
            throw new InvalidRequestException("At least one product size is required");
        }
        for (SizePrice psDto : sizePrices) {
            SizeResponse size = catalogServiceClient.getSize(psDto.getSizeId());
            product.addProductSize(ProductSize.builder()
                    .sizeId(size.getId())
                    .price(psDto.getPrice())
                    .build());
        }
    }

    private void setImageIfPresent(Products product, MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) return;
        ImageUploadResponse image = imageServiceClient.uploadImage(imageFile, "product");
        product.setImageURL(image.getUrl());
        product.setPublicID(image.getPublic_id());
    }

    private Products getById(UUID id) {
        return productRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private DoubleSummaryStatistics calculatePriceStats(Products product) {
        return product.getProductSizes().stream()
                .mapToDouble(ps -> ps.getPrice().doubleValue())
                .summaryStatistics();
    }

    private CategoryResponse getCategoryResponse(UUID categoryId) {
        return catalogServiceClient.getCategory(categoryId);
    }
}
