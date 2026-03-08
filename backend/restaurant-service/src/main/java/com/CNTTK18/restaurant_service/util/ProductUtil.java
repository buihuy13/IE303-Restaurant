package com.CNTTK18.restaurant_service.util;

import com.CNTTK18.restaurant_service.dto.product.response.ProductResponse;
import com.CNTTK18.restaurant_service.dto.product.response.ProductResponseWithoutRes;
import com.CNTTK18.restaurant_service.dto.productSize.response.ProductSizeResponse;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponse;
import com.CNTTK18.restaurant_service.model.Products;

public class ProductUtil {
    public static ProductResponse mapProductToProductResponse(Products product, ResResponse resResponse) {
        return ProductResponse.builder()
                .available(product.isAvailable())
                .id(product.getId())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getCateName())
                .description(product.getDescription())
                .imageURL(product.getImageURL())
                .productName(product.getProductName())
                .productSizes(product.getProductSizes().stream()
                        .map(ps -> new ProductSizeResponse(
                                ps.getId(),
                                ps.getSize().getName(),
                                ps.getPrice(),
                                ps.getSize().getId()))
                        .toList())
                .restaurant(resResponse)
                .rating(product.getRating())
                .slug(product.getSlug())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public static ProductResponse mapProductToProductResponseWitoutResParam(Products product) {
        return ProductResponse.builder()
                .available(product.isAvailable())
                .id(product.getId())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getCateName())
                .description(product.getDescription())
                .imageURL(product.getImageURL())
                .productName(product.getProductName())
                .productSizes(product.getProductSizes().stream()
                        .map(ps -> new ProductSizeResponse(
                                ps.getId(),
                                ps.getSize().getName(),
                                ps.getPrice(),
                                ps.getSize().getId()))
                        .toList())
                .rating(product.getRating())
                .restaurant(ResUtil.mapResToResResponse(product.getRestaurant()))
                .slug(product.getSlug())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public static ProductResponseWithoutRes mapProductToProductResponseWithoutResParam(Products product) {
        return ProductResponseWithoutRes.builder()
                .available(product.isAvailable())
                .id(product.getId())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getCateName())
                .description(product.getDescription())
                .imageURL(product.getImageURL())
                .productName(product.getProductName())
                .productSizes(product.getProductSizes().stream()
                        .map(ps -> new ProductSizeResponse(
                                ps.getId(),
                                ps.getSize().getName(),
                                ps.getPrice(),
                                ps.getSize().getId()))
                        .toList())
                .rating(product.getRating())
                .slug(product.getSlug())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
