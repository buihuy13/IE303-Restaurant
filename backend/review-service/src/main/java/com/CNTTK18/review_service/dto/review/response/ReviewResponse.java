package com.CNTTK18.review_service.dto.review.response;

import java.time.Instant;
import java.util.UUID;

import com.CNTTK18.review_service.model.data.ReviewType;

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
public class ReviewResponse {
    private UUID id;
    private UUID userId;
    private UUID reviewId;
    private ReviewType reviewType;
    private String title;
    private String content;
    private Float rating;
    private Instant createdAt;
    private Instant updatedAt;
}
