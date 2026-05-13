package com.CNTTK18.recommendation_service.client.feign;

import java.util.List;
import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

@FeignClient(name = "product-service")
public interface ProductServiceFeignClient {

    @GetMapping("/api/products")
    @CircuitBreaker(name = "productService")
    @Retry(name = "productService")
    Map<String, Object> getProducts(
            @RequestParam("lat") double lat,
            @RequestParam("lon") double lon,
            @RequestParam("page") int page,
            @RequestParam("size") int size);

    default Map<String, Object> getProductsFallback(double lat, double lon, int page, int size) {
        return Map.of("content", List.of());
    }
}
