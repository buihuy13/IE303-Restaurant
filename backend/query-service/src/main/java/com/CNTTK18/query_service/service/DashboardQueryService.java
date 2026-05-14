package com.CNTTK18.query_service.service;

import java.util.UUID;

public interface DashboardQueryService {
    long countRestaurants();

    long countProducts();

    long countProductsByRestaurant(UUID restaurantId);

    Double getAverageRestaurantRating();

    Double getAverageProductRating();

    long countTotalReviews();

    Long countReviewsByRestaurant(UUID restaurantId);
}
