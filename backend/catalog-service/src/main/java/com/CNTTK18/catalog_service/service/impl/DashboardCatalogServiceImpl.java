package com.CNTTK18.catalog_service.service.impl;

import org.springframework.stereotype.Service;

import com.CNTTK18.catalog_service.repository.CategoryRepository;
import com.CNTTK18.catalog_service.repository.SizeRepository;
import com.CNTTK18.catalog_service.service.DashboardCatalogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardCatalogServiceImpl implements DashboardCatalogService {

    private final CategoryRepository categoryRepository;
    private final SizeRepository sizeRepository;

    @Override
    public long countCategories() {
        return categoryRepository.count();
    }

    @Override
    public long countSizes() {
        return sizeRepository.count();
    }
}
