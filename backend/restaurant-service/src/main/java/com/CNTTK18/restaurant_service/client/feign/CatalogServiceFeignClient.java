package com.CNTTK18.restaurant_service.client.feign;

import java.util.List;
import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.CNTTK18.restaurant_service.client.feign.dto.CategoryResponse;
import com.CNTTK18.restaurant_service.client.feign.dto.SizeResponse;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

@FeignClient(name = "catalog-service")
public interface CatalogServiceFeignClient {
    @GetMapping("/api/catalog/category/{id}")
    @CircuitBreaker(name = "catalogService")
    @Retry(name = "catalogService")
    CategoryResponse getCategory(@PathVariable("id") UUID id);

    @GetMapping("/api/catalog/size/all")
    @CircuitBreaker(name = "catalogService")
    @Retry(name = "catalogService")
    List<SizeResponse> getAllSizes();

    @GetMapping("/api/catalog/size/{id}")
    @CircuitBreaker(name = "catalogService")
    @Retry(name = "catalogService")
    SizeResponse getSize(@PathVariable("id") UUID id);
}
