package com.CNTTK18.restaurant_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.CNTTK18.restaurant_service.dto.productSize.response.ProductSizeResponse;
import com.CNTTK18.restaurant_service.model.ProductSize;

@Mapper(componentModel = "spring")
public interface ProductSizeMapper {
    @Mapping(target = "sizeName", source = "size.name")
    ProductSizeResponse toProductSizeResponse(ProductSize productSize);
}
