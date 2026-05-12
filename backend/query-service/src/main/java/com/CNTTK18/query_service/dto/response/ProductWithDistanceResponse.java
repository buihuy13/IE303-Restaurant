package com.CNTTK18.query_service.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
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
public class ProductWithDistanceResponse {
    private UUID id;
    private String productName;
    private String description;
    private String imageURL;
    private String categoryName;
    private UUID categoryId;
    private String restaurantName;
    private UUID restaurantId;
    private boolean available;
    private Integer totalReview;
    private BigDecimal rating;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String slug;
    private Instant createdAt;
    private Instant updatedAt;
    private Double distance;
    private Double duration;
}
