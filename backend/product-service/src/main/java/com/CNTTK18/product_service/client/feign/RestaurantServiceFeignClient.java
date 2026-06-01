package com.CNTTK18.product_service.client.feign;

import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.CNTTK18.product_service.client.feign.dto.RestaurantExistsResponse;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

@FeignClient(name = "restaurant-service")
public interface RestaurantServiceFeignClient {

    @GetMapping("/api/restaurant/admin/{id}")
    @CircuitBreaker(name = "restaurantService")
    @Retry(name = "restaurantService")
    RestaurantExistsResponse getRestaurantById(@PathVariable UUID id);
}
