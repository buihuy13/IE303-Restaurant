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
public class RestaurantStatsResponse {
    private String id;
    private String resName;
    private String slug;
    private String address;
    private String imageURL;
    private float rating;
    private int totalReview;
    private int productCount;
    private boolean enabled;
    private String openingTime;
    private String closingTime;
}
