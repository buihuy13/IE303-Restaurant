package com.CNTTK18.product_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.CNTTK18.product_service.dto.product.response.ProductResponse;
import com.CNTTK18.product_service.model.Products;

@Mapper(
        componentModel = "spring",
        uses = {ProductSizeMapper.class})
public interface ProductMapper {
    @Mapping(target = "categoryName", ignore = true)
    @Mapping(target = "categoryId", source = "categoryId")
    @Mapping(target = "productSizes", source = "productSizes")
    ProductResponse toProductResponse(Products product);
}
