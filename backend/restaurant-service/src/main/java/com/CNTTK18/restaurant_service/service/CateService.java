package com.CNTTK18.restaurant_service.service;

import java.util.HashSet;
import java.util.List;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.RandomIdGenerator;
import com.CNTTK18.restaurant_service.dto.cate.request.CateRequest;
import com.CNTTK18.restaurant_service.model.Categories;
import com.CNTTK18.restaurant_service.repository.CateRepository;

@Service
public class CateService {
    private CateRepository cateRepository;

    public CateService(CateRepository cateRepository) {
        this.cateRepository = cateRepository;
    }

    public List<Categories> getAllCategories() {
        return cateRepository.findAll();
    }

    public Categories getCateById(String id) {
        Categories cate =
                cateRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        return cate;
    }

    public Categories getCateByName(String name) {
        Categories cate = cateRepository
                .findByCateName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        return cate;
    }

    @Transactional
    public Categories createCate(CateRequest cateRequest) {
        Categories cate = new Categories(RandomIdGenerator.generate(10), cateRequest.getCateName(), new HashSet<>());
        return cateRepository.save(cate);
    }

    @Transactional
    public Categories updateCate(String id, CateRequest cateRequest) {
        Categories cate =
                cateRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        cate.setCateName(cateRequest.getCateName());
        return cateRepository.save(cate);
    }

    @Transactional
    public void deleteCate(String id) {
        Categories cate =
                cateRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        cateRepository.delete(cate);
    }
}
