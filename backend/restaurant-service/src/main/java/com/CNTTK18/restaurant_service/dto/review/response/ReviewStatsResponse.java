package com.CNTTK18.restaurant_service.dto.review.response;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewStatsResponse {
    private Double averageRating;
    private Long totalReviews;
    private Map<Integer, Long> ratingDistribution;
}
