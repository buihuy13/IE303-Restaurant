package com.CNTTK18.catalog_service.service;

import java.util.List;

import com.CNTTK18.catalog_service.dto.category.request.CategoryRequest;
import com.CNTTK18.catalog_service.dto.category.response.CategoryResponse;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryById(java.util.UUID id);

    CategoryResponse getCategoryByName(String name);

    CategoryResponse createCategory(CategoryRequest categoryRequest);

    CategoryResponse updateCategory(java.util.UUID id, CategoryRequest categoryRequest);

    void deleteCategory(java.util.UUID id);
}
