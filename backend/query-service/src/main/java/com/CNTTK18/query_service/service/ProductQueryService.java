package com.CNTTK18.query_service.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.CNTTK18.query_service.dto.query.ProductQuery;
import com.CNTTK18.query_service.dto.response.ProductWithDistanceResponse;

public interface ProductQueryService {

    Page<ProductWithDistanceResponse> getNearbyProducts(ProductQuery query, Pageable pageable);
}
