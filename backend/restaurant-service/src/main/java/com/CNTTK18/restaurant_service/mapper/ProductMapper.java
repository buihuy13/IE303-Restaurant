package com.CNTTK18.restaurant_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.CNTTK18.restaurant_service.dto.product.response.ProductResponseWithoutRes;
import com.CNTTK18.restaurant_service.model.Products;

@Mapper(componentModel = "spring", uses = {ProductSizeMapper.class})
public interface ProductMapper {
    @Mapping(target = "categoryName", source = "category.categoryName")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "productSizes", source = "productSizes")
    ProductResponseWithoutRes toProductResponseWithoutRes(Products product);
}
