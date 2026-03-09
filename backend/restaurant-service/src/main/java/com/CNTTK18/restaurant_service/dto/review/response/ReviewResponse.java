package com.CNTTK18.restaurant_service.dto.review.response;

import java.time.ZonedDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ReviewResponse {
    private UUID id;
    private UUID userId;
    private UUID reviewId;
    private String reviewType;
    private String title;
    private String content;
    private float rating;
    private ZonedDateTime createdAt;
}
