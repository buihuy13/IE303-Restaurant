package com.CNTTK18.dashboard_service.dto.restaurant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantCountsResponse {
    private long totalRestaurants;
    private long totalProducts;
    private long totalCategories;
}
