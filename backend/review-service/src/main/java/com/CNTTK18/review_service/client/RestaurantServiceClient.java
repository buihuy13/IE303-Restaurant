package com.CNTTK18.review_service.client;

import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

@FeignClient(name = "restaurant-service")
public interface RestaurantServiceClient {

    @GetMapping("/api/restaurant/admin/{id}")
    @CircuitBreaker(name = "restaurantService")
    @Retry(name = "restaurantService")
    void getRestaurantById(@PathVariable("id") UUID id);
}
