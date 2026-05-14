package com.CNTTK18.review_service.service;

import java.util.Map;
import java.util.UUID;

public interface DashboardReviewService {
    Map<Integer, Long> getGlobalRatingDistribution();

    Long countReviewsByRestaurant(UUID restaurantId);
}
