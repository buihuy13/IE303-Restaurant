package com.CNTTK18.catalog_service.service;

import java.util.List;

import com.CNTTK18.catalog_service.dto.size.request.SizeRequest;
import com.CNTTK18.catalog_service.dto.size.response.SizeResponse;

public interface SizeService {
    List<SizeResponse> getAllSizes();

    SizeResponse getSizeById(java.util.UUID id);

    SizeResponse createSize(SizeRequest sizeRequest);

    SizeResponse updateSize(java.util.UUID id, SizeRequest sizeRequest);

    void deleteSize(java.util.UUID id);
}
