package com.CNTTK18.query_service.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.query_service.dto.query.ProductQuery;
import com.CNTTK18.query_service.dto.response.ProductWithDistanceResponse;
import com.CNTTK18.query_service.service.ProductQueryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/query/products")
@RequiredArgsConstructor
@Tag(name = "Query Service - Products")
public class ProductQueryController {

    private final ProductQueryService productQueryService;

    @Tag(name = "Get")
    @Operation(summary = "Get nearby products with distance calculation")
    @GetMapping
    public Page<ProductWithDistanceResponse> getNearbyProducts(@ModelAttribute ProductQuery query, Pageable pageable) {
        return productQueryService.getNearbyProducts(query, pageable);
    }
}
