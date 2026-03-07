package com.CNTTK18.restaurant_service.dto.dashboard.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MerchantOverviewResponse {
    // Restaurant info
    private String restaurantId;
    private String restaurantName;
    private String restaurantSlug;
    private boolean restaurantEnabled;

    // Statistics
    private int totalProducts;
    private float rating;
    private int totalReviews;
    private String address;
    private String imageURL;
    private String openingTime;
    private String closingTime;
}
