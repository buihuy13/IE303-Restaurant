package com.CNTTK18.Common.Event.Review;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductReviewSummaryUpdatedEvent {
    private UUID productId;
    private float rating;
    private int totalReview;
    private Instant updatedAt;
}