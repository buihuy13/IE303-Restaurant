package com.CNTTK18.query_service.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.CNTTK18.query_service.dto.query.RestaurantQuery;
import com.CNTTK18.query_service.dto.request.Coordinates;
import com.CNTTK18.query_service.dto.response.RestaurantWithDistanceResponse;

public interface RestaurantQueryService {

    RestaurantWithDistanceResponse getRestaurantById(UUID id, Coordinates location);

    Page<RestaurantWithDistanceResponse> getNearbyRestaurants(RestaurantQuery query, Pageable pageable);
}
