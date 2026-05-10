package com.CNTTK18.catalog_service.mapper;

import org.mapstruct.Mapper;

import com.CNTTK18.catalog_service.dto.category.response.CategoryResponse;
import com.CNTTK18.catalog_service.model.Category;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toCategoryResponse(Category category);
}
