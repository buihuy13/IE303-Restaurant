package com.CNTTK18.restaurant_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.CNTTK18.restaurant_service.dto.cate.response.CateResponse;
import com.CNTTK18.restaurant_service.model.Categories;

@Mapper(componentModel = "spring")
public interface CateMapper {
    @Mapping(target = "cateId", source = "id")
    CateResponse toCateResponse(Categories cate);
}
