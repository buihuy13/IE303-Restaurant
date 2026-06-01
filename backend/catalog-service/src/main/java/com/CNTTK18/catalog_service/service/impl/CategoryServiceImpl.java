package com.CNTTK18.catalog_service.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.catalog_service.dto.category.request.CategoryRequest;
import com.CNTTK18.catalog_service.dto.category.response.CategoryResponse;
import com.CNTTK18.catalog_service.mapper.CategoryMapper;
import com.CNTTK18.catalog_service.model.Category;
import com.CNTTK18.catalog_service.repository.CategoryRepository;
import com.CNTTK18.catalog_service.service.CategoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Cacheable(value = "categories", key = "'all'")
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toCategoryResponse)
                .toList();
    }

    @Override
    @Cacheable(value = "categories", key = "#id")
    public CategoryResponse getCategoryById(UUID id) {
        Category category = getCategoryEntityById(id);
        return categoryMapper.toCategoryResponse(category);
    }

    @Override
    @Cacheable(value = "categories", key = "'name:' + #name")
    public CategoryResponse getCategoryByName(String name) {
        Category category = categoryRepository
                .findByCateName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with name: " + name));
        return categoryMapper.toCategoryResponse(category);
    }

    @Transactional
    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse createCategory(CategoryRequest categoryRequest) {
        if (categoryRepository.existsByCateName(categoryRequest.getCateName())) {
            throw new RuntimeException("Category already exists with name: " + categoryRequest.getCateName());
        }
        Category category =
                Category.builder().cateName(categoryRequest.getCateName()).build();
        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toCategoryResponse(savedCategory);
    }

    @Transactional
    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse updateCategory(UUID id, CategoryRequest categoryRequest) {
        Category category = getCategoryEntityById(id);

        if (!category.getCateName().equals(categoryRequest.getCateName())
                && categoryRepository.existsByCateName(categoryRequest.getCateName())) {
            throw new RuntimeException("Category already exists with name: " + categoryRequest.getCateName());
        }

        category.setCateName(categoryRequest.getCateName());
        Category updatedCategory = categoryRepository.save(category);
        return categoryMapper.toCategoryResponse(updatedCategory);
    }

    @Transactional
    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(UUID id) {
        Category category = getCategoryEntityById(id);
        categoryRepository.delete(category);
    }

    private Category getCategoryEntityById(UUID id) {
        return categoryRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }
}
