package com.CNTTK18.recommendation_service.service;

import java.util.List;

import com.CNTTK18.recommendation_service.dto.request.MoodFoodRecommendationRequest;
import com.CNTTK18.recommendation_service.dto.request.ReviewRequest;
import com.CNTTK18.recommendation_service.dto.response.MessageResponse;
import com.CNTTK18.recommendation_service.dto.response.ReviewSummarizeResponse;

public interface RecommendationService {
    public MessageResponse recommendFood(String userContext);

    public MessageResponse recommendFoodByMood(MoodFoodRecommendationRequest request);

    public List<MessageResponse> generateFoodDescription(String foodName);

    public ReviewSummarizeResponse summarizeReviews(ReviewRequest reviewRequest);
}
