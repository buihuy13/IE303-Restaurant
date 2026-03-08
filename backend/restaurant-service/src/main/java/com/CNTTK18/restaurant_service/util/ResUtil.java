package com.CNTTK18.restaurant_service.util;

import com.CNTTK18.restaurant_service.dto.cate.response.CateResponse;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponse;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponseWithProduct;
import com.CNTTK18.restaurant_service.model.Restaurants;

public class ResUtil {
    public static ResResponse mapResToResResponse(Restaurants res) {
        return ResResponse.builder()
                .id(res.getId())
                .address(res.getAddress())
                .resName(res.getResName())
                .longitude(res.getLongitude())
                .latitude(res.getLatitude())
                .rating(res.getRating())
                .openingTime(res.getOpeningTime())
                .closingTime(res.getClosingTime())
                .phone(res.getPhone())
                .imageURL(res.getImageURL())
                .merchantId(res.getMerchantId())
                .enabled(res.isEnabled())
                .totalReview(res.getTotalReview())
                .cate(res.getCategories().stream()
                        .map(c -> new CateResponse(c.getId(), c.getCateName()))
                        .toList())
                .slug(res.getSlug())
                .createdAt(res.getCreatedAt())
                .updatedAt(res.getUpdatedAt())
                .build();
    }

    public static ResResponse mapResToResResponsewithDistanceAndDuration(
            Restaurants res, Double distance, Double duration) {
        return ResResponse.builder()
                .id(res.getId())
                .address(res.getAddress())
                .resName(res.getResName())
                .longitude(res.getLongitude())
                .latitude(res.getLatitude())
                .rating(res.getRating())
                .openingTime(res.getOpeningTime())
                .closingTime(res.getClosingTime())
                .phone(res.getPhone())
                .imageURL(res.getImageURL())
                .merchantId(res.getMerchantId())
                .enabled(res.isEnabled())
                .totalReview(res.getTotalReview())
                .distance(distance)
                .duration(duration)
                .cate(res.getCategories().stream()
                        .map(c -> new CateResponse(c.getId(), c.getCateName()))
                        .toList())
                .slug(res.getSlug())
                .createdAt(res.getCreatedAt())
                .updatedAt(res.getUpdatedAt())
                .build();
    }

    public static ResResponseWithProduct mapResToResResponseWithProduct(Restaurants res) {
        return ResResponseWithProduct.builder()
                .id(res.getId())
                .address(res.getAddress())
                .resName(res.getResName())
                .longitude(res.getLongitude())
                .latitude(res.getLatitude())
                .rating(res.getRating())
                .openingTime(res.getOpeningTime())
                .closingTime(res.getClosingTime())
                .phone(res.getPhone())
                .imageURL(res.getImageURL())
                .merchantId(res.getMerchantId())
                .enabled(res.isEnabled())
                .totalReview(res.getTotalReview())
                .products(res.getProducts().stream()
                        .map(ProductUtil::mapProductToProductResponseWithoutResParam)
                        .toList())
                .cate(res.getCategories().stream()
                        .map(c -> new CateResponse(c.getId(), c.getCateName()))
                        .toList())
                .slug(res.getSlug())
                .createdAt(res.getCreatedAt())
                .updatedAt(res.getUpdatedAt())
                .build();
    }

    public static ResResponseWithProduct mapResToResResponseWithProductandDistanceAndDuration(
            Restaurants res, Double distance, Double duration) {
        return ResResponseWithProduct.builder()
                .id(res.getId())
                .address(res.getAddress())
                .resName(res.getResName())
                .longitude(res.getLongitude())
                .latitude(res.getLatitude())
                .rating(res.getRating())
                .openingTime(res.getOpeningTime())
                .closingTime(res.getClosingTime())
                .phone(res.getPhone())
                .imageURL(res.getImageURL())
                .merchantId(res.getMerchantId())
                .enabled(res.isEnabled())
                .totalReview(res.getTotalReview())
                .distance(distance)
                .duration(duration)
                .products(res.getProducts().stream()
                        .map(ProductUtil::mapProductToProductResponseWithoutResParam)
                        .toList())
                .cate(res.getCategories().stream()
                        .map(c -> new CateResponse(c.getId(), c.getCateName()))
                        .toList())
                .slug(res.getSlug())
                .createdAt(res.getCreatedAt())
                .updatedAt(res.getUpdatedAt())
                .build();
    }
}
