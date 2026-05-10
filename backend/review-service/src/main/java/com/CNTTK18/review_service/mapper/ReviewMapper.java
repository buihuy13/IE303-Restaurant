package com.CNTTK18.review_service.mapper;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.CNTTK18.review_service.dto.review.response.ReviewListResponse;
import com.CNTTK18.review_service.dto.review.response.ReviewResponse;
import com.CNTTK18.review_service.dto.review.response.ReviewStatsResponse;
import com.CNTTK18.review_service.model.Review;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "convertToVNZone")
    @Mapping(target = "updatedAt", source = "updatedAt", qualifiedByName = "convertToVNZone")
    ReviewResponse toReviewResponse(Review review);

    @Named("convertToVNZone")
    default ZonedDateTime convertToVNZone(Instant instant) {
        if (instant == null) return null;
        return instant.atZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    }

    default ReviewListResponse toReviewListResponse(List<Review> reviews) {
        List<ReviewResponse> items = reviews == null ? List.of()
                : reviews.stream().map(this::toReviewResponse).collect(Collectors.toList());
        return ReviewListResponse.builder()
                .reviews(items)
                .total(items.size())
                .build();
    }

    default ReviewStatsResponse toReviewStats(List<Review> reviews) {
        if (reviews == null || reviews.isEmpty()) {
            return ReviewStatsResponse.builder()
                    .averageRating(0.0)
                    .totalReviews(0L)
                    .ratingDistribution(Map.of())
                    .build();
        }

        double average = reviews.stream().mapToDouble(Review::getRating).average().orElse(0.0);
        Map<Integer, Long> dist = reviews.stream()
                .collect(Collectors.groupingBy(r -> (int) Math.floor(r.getRating()), Collectors.counting()));

        return ReviewStatsResponse.builder()
                .averageRating(average)
                .totalReviews((long) reviews.size())
                .ratingDistribution(dist)
                .build();
    }
}
