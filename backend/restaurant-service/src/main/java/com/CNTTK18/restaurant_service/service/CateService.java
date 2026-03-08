package com.CNTTK18.restaurant_service.service;

import java.util.List;
import java.util.UUID;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.restaurant_service.dto.cate.request.CateRequest;
import com.CNTTK18.restaurant_service.model.Categories;
import com.CNTTK18.restaurant_service.repository.CateRepository;

@Service
@RequiredArgsConstructor
public class CateService {
    private final CateRepository cateRepository;

    public List<Categories> getAllCategories() {
        return cateRepository.findAll();
    }

    public Categories getCateById(UUID id) {
        return cateRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    public Categories getCateByName(String name) {
        return cateRepository.findByCateName(name)
                            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    @Transactional
    public Categories createCate(CateRequest cateRequest) {
        Categories cate = Categories.builder().cateName(cateRequest.getCateName()).build();
        return cateRepository.save(cate);
    }

    @Transactional
    public Categories updateCate(UUID id, CateRequest cateRequest) {
        Categories cate = getCateById(id);
        cate.setCateName(cateRequest.getCateName());
        return cateRepository.save(cate);
    }

    @Transactional
    public void deleteCate(UUID id) {
        Categories cate = getCateById(id);
        cateRepository.delete(cate);
    }
}
