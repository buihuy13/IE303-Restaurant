package com.CNTTK18.dashboard_service.client;

import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.CNTTK18.dashboard_service.dto.restaurant.ResClientResponse;
import com.CNTTK18.dashboard_service.dto.restaurant.RestaurantCountsResponse;

@FeignClient(name = "restaurant-service")
public interface RestaurantDashboardDataClient {

    @GetMapping("/internal/dashboard/restaurants/counts")
    RestaurantCountsResponse getCounts();

    @GetMapping("/internal/dashboard/restaurants/average-rating")
    Double getAverageRating();

    @GetMapping("/api/restaurant/merchant/{id}")
    ResClientResponse getRestaurantByMerchantId(@PathVariable("id") UUID merchantId);
}
