package com.CNTTK18.product_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.CNTTK18.product_service.dto.productSize.response.ProductSizeResponse;
import com.CNTTK18.product_service.model.ProductSize;

@Mapper(componentModel = "spring")
public interface ProductSizeMapper {
    @Mapping(target = "sizeName", ignore = true)
    @Mapping(target = "sizeId", source = "sizeId")
    ProductSizeResponse toProductSizeResponse(ProductSize productSize);
}
