package com.CNTTK18.dashboard_service.dto.restaurant;

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
public class RestaurantAdminStatsResponse {
    private long totalRestaurants;
    private long totalProducts;
    private long totalCategories;
    private double averageRating;
    private long totalReviews;
}
