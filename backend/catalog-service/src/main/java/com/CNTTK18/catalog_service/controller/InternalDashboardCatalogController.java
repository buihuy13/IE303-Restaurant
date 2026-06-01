package com.CNTTK18.catalog_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.catalog_service.service.DashboardCatalogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/internal/dashboard")
@RequiredArgsConstructor
public class InternalDashboardCatalogController {

    private final DashboardCatalogService dashboardCatalogService;

    @GetMapping("/categories/count")
    public ResponseEntity<Long> countCategories() {
        return ResponseEntity.ok(dashboardCatalogService.countCategories());
    }

    @GetMapping("/sizes/count")
    public ResponseEntity<Long> countSizes() {
        return ResponseEntity.ok(dashboardCatalogService.countSizes());
    }
}
