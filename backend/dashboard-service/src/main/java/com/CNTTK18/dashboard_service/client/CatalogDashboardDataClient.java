package com.CNTTK18.dashboard_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "catalog-service")
public interface CatalogDashboardDataClient {

    @GetMapping("/internal/dashboard/categories/count")
    long countCategories();

    @GetMapping("/internal/dashboard/sizes/count")
    long countSizes();
}
