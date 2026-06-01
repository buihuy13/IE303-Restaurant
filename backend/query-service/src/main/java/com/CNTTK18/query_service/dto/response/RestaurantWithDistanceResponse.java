package com.CNTTK18.query_service.dto.response;

import java.math.BigDecimal;
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
public class RestaurantWithDistanceResponse {
    private UUID id;
    private String resName;
    private String address;
    private Double latitude;
    private Double longitude;
    private BigDecimal rating;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private String phone;
    private String imageURL;
    private UUID merchantId;
    private boolean enabled;
    private Integer totalReview;
    private String slug;
    private Double distance;
    private Double duration;
    private Instant createdAt;
    private Instant updatedAt;
}
