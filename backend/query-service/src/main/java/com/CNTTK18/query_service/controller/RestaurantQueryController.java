package com.CNTTK18.query_service.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.query_service.dto.query.RestaurantQuery;
import com.CNTTK18.query_service.dto.request.Coordinates;
import com.CNTTK18.query_service.dto.response.RestaurantWithDistanceResponse;
import com.CNTTK18.query_service.service.RestaurantQueryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/query/restaurants")
@RequiredArgsConstructor
public class RestaurantQueryController {

    private final RestaurantQueryService restaurantQueryService;

    @Tag(name = "Get")
    @Operation(summary = "Get restaurant with distance calculation")
    @GetMapping("/{id}")
    public RestaurantWithDistanceResponse getRestaurantById(
            @PathVariable UUID id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {

        Coordinates location = null;
        if (lat != null && lon != null) {
            location = new Coordinates(lon, lat);
        }

        return restaurantQueryService.getRestaurantById(id, location);
    }

    @Tag(name = "Get")
    @Operation(summary = "Get nearby restaurants with distance calculation")
    @GetMapping
    public Page<RestaurantWithDistanceResponse> getNearbyRestaurants(
            @ModelAttribute RestaurantQuery query, Pageable pageable) {
        return restaurantQueryService.getNearbyRestaurants(query, pageable);
    }
}
