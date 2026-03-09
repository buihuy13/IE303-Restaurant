package com.CNTTK18.restaurant_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.CNTTK18.restaurant_service.dto.product.response.ProductResponse;
import com.CNTTK18.restaurant_service.model.Products;

@Mapper(
        componentModel = "spring",
        uses = {ProductSizeMapper.class})
public interface ProductMapper {
    @Mapping(target = "categoryName", source = "category.cateName")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "productSizes", source = "productSizes")
    @Mapping(target = "distance", ignore = true)
    @Mapping(target = "duration", ignore = true)
    ProductResponse toProductResponse(Products product);

    @Mapping(target = "categoryName", source = "product.category.cateName")
    @Mapping(target = "categoryId", source = "product.category.id")
    @Mapping(target = "productSizes", source = "product.productSizes")
    @Mapping(target = "distance", source = "distance")
    @Mapping(target = "duration", source = "duration")
    ProductResponse toProductResponse(Products product, Double distance, Double duration);
}
