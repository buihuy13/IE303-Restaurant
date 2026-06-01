package com.CNTTK18.Common.Event.Product;

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
public class ProductUpdatedEvent {
    private UUID id;
    private String productName;
    private UUID restaurantId;
    private UUID categoryId;
    private String slug;
    private boolean available;
    private Double minPrice;
    private Double maxPrice;
    private String imageUrl;
    private float rating;
    private int totalReview;
    private Instant updatedAt;
}
