package com.CNTTK18.restaurant_service.service;

import java.util.List;
import java.util.UUID;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.restaurant_service.dto.cate.request.CateRequest;
import com.CNTTK18.restaurant_service.dto.cate.response.CateResponse;
import com.CNTTK18.restaurant_service.mapper.CateMapper;
import com.CNTTK18.restaurant_service.model.Categories;
import com.CNTTK18.restaurant_service.repository.CateRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CateService {
    private final CateRepository cateRepository;
    private final CateMapper cateMapper;

    public List<CateResponse> getAllCategories() {
        return cateRepository.findAll().stream().map(cateMapper::toCateResponse).toList();
    }

    public CateResponse getCateById(UUID id) {
        Categories cate = cateRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return cateMapper.toCateResponse(cate);
    }

    public CateResponse getCateByName(String name) {
        Categories cate = cateRepository
                            .findByCateName(name)
                            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return cateMapper.toCateResponse(cate);
    }

    @Transactional
    public CateResponse createCate(CateRequest cateRequest) {
        Categories cate =
                Categories.builder().cateName(cateRequest.getCateName()).build();
        return cateMapper.toCateResponse(cateRepository.save(cate));
    }

    @Transactional
    public CateResponse updateCate(UUID id, CateRequest cateRequest) {
        Categories cate = cateRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        cate.setCateName(cateRequest.getCateName());
        return cateMapper.toCateResponse(cateRepository.save(cate));
    }

    @Transactional
    public void deleteCate(UUID id) {
        Categories cate = cateRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        cateRepository.delete(cate);
    }
}
