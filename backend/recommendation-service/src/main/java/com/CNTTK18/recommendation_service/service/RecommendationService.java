package com.CNTTK18.recommendation_service.service;

import java.util.List;

import com.CNTTK18.recommendation_service.dto.response.MessageResponse;

public interface RecommendationService {
    public MessageResponse recommendFood(String userContext);

    public List<MessageResponse> generateFoodDescription(String foodName);

    // public MessageResponse summarizeReviews();
}
