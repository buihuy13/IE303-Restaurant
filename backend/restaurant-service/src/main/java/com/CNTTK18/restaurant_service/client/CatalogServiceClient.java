package com.CNTTK18.restaurant_service.client;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.CNTTK18.restaurant_service.dto.category.response.CategoryResponse;
import com.CNTTK18.restaurant_service.dto.size.response.SizeResponse;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class CatalogServiceClient {

    private final WebClient.Builder webClientBuilder;

    private static final String CATALOG_SERVICE = "catalogService";
    private static final String CATALOG_SERVICE_URL = "http://catalog-service";

    @CircuitBreaker(name = CATALOG_SERVICE, fallbackMethod = "getCategoryFallback")
    public CategoryResponse getCategory(UUID categoryId) {
        return webClientBuilder
                .build()
                .get()
                .uri(CATALOG_SERVICE_URL + "/api/catalog/category/{id}", categoryId)
                .retrieve()
                .bodyToMono(CategoryResponse.class)
                .timeout(Duration.ofSeconds(3))
                .block();
    }

    @CircuitBreaker(name = CATALOG_SERVICE, fallbackMethod = "getAllSizesFallback")
    public List<SizeResponse> getAllSizes() {
        return webClientBuilder
                .build()
                .get()
                .uri(CATALOG_SERVICE_URL + "/api/catalog/size/all")
                .retrieve()
                .bodyToFlux(SizeResponse.class)
                .collectList()
                .timeout(Duration.ofSeconds(2))
                .block();
    }

    @CircuitBreaker(name = CATALOG_SERVICE, fallbackMethod = "getSizeFallback")
    public SizeResponse getSize(UUID sizeId) {
        return webClientBuilder
                .build()
                .get()
                .uri(CATALOG_SERVICE_URL + "/api/catalog/size/{id}", sizeId)
                .retrieve()
                .bodyToMono(SizeResponse.class)
                .timeout(Duration.ofSeconds(2))
                .block();
    }

    // Fallback methods
    private CategoryResponse getCategoryFallback(UUID categoryId, Throwable throwable) {
        log.error("Failed to get category {}: {}", categoryId, throwable.getMessage());
        return CategoryResponse.builder()
                .id(categoryId)
                .cateName("Unknown Category")
                .build();
    }

    private List<SizeResponse> getAllSizesFallback(Throwable throwable) {
        log.error("Failed to get all sizes: {}", throwable.getMessage());
        return List.of();
    }

    private SizeResponse getSizeFallback(UUID sizeId, Throwable throwable) {
        log.error("Failed to get size {}: {}", sizeId, throwable.getMessage());
        return SizeResponse.builder().id(sizeId).name("Unknown Size").build();
    }
}
