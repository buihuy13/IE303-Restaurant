package com.CNTTK18.review_service.client;

import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "restaurant-service")
public interface RestaurantServiceClient {

    @GetMapping("/api/restaurant/admin/{id}")
    void getRestaurantById(@PathVariable("id") UUID id);
}