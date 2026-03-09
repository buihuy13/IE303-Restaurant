package com.CNTTK18.restaurant_service.service.Impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.restaurant_service.dto.cate.request.CateRequest;
import com.CNTTK18.restaurant_service.dto.cate.response.CateResponse;
import com.CNTTK18.restaurant_service.mapper.CateMapper;
import com.CNTTK18.restaurant_service.model.Categories;
import com.CNTTK18.restaurant_service.repository.CateRepository;
import com.CNTTK18.restaurant_service.service.CateService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CateServiceImpl implements CateService {
    private final CateRepository cateRepository;
    private final CateMapper cateMapper;

    @Override
    public List<CateResponse> getAllCategories() {
        return cateRepository.findAll().stream().map(cateMapper::toCateResponse).toList();
    }

    @Override
    public CateResponse getCateById(UUID id) {
        Categories cate = findCateById(id);
        return cateMapper.toCateResponse(cate);
    }

    @Override
    public CateResponse getCateByName(String name) {
        Categories cate = cateRepository
                .findByCateName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return cateMapper.toCateResponse(cate);
    }

    @Override
    @Transactional
    public CateResponse createCate(CateRequest cateRequest) {
        Categories cate =
                Categories.builder().cateName(cateRequest.getCateName()).build();
        return cateMapper.toCateResponse(cateRepository.save(cate));
    }

    @Override
    @Transactional
    public CateResponse updateCate(UUID id, CateRequest cateRequest) {
        Categories cate = findCateById(id);
        cate.setCateName(cateRequest.getCateName());
        return cateMapper.toCateResponse(cateRepository.save(cate));
    }

    @Override
    @Transactional
    public void deleteCate(UUID id) {
        Categories cate = findCateById(id);
        cateRepository.delete(cate);
    }

    private Categories findCateById(UUID id) {
        return cateRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }
}
