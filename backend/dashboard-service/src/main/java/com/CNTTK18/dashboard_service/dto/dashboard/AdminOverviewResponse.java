package com.CNTTK18.dashboard_service.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminOverviewResponse {
    private Long pendingOrders;
    private Long completedOrders;
    private Long cancelledOrders;
    private Long totalUsers;
    private Long totalRestaurants;
    private Long totalProducts;
    private Long totalCategories;
    private Double averageRating;
    private Long totalReviews;
}
