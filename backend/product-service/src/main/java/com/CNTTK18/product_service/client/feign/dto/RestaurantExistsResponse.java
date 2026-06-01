package com.CNTTK18.product_service.client.feign.dto;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

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
public class RestaurantExistsResponse {
    private UUID id;
    private String resName;
    private String address;
    private Double longitude;
    private Double latitude;
    private Float rating;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private String phone;
    private String imageURL;
    private UUID merchantId;
    private boolean enabled;
    private int totalReview;
    private String slug;
    private Instant createdAt;
    private Instant updatedAt;
}
