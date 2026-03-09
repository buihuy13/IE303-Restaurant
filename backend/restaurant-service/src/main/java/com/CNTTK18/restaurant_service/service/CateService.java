package com.CNTTK18.restaurant_service.service;

import java.util.List;
import java.util.UUID;

import com.CNTTK18.restaurant_service.dto.cate.request.CateRequest;
import com.CNTTK18.restaurant_service.dto.cate.response.CateResponse;

public interface CateService {

    public List<CateResponse> getAllCategories();

    public CateResponse getCateById(UUID id);

    public CateResponse getCateByName(String name);

    public CateResponse createCate(CateRequest cateRequest);

    public CateResponse updateCate(UUID id, CateRequest cateRequest);

    public void deleteCate(UUID id);
}
