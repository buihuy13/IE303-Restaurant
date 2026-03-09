package com.CNTTK18.restaurant_service.dto.product.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.CNTTK18.restaurant_service.dto.productSize.response.ProductSizeResponse;

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
public class ProductResponse {
    private UUID id;
    private String productName;
    private String description;
    private String imageURL;
    private String categoryName;
    private UUID categoryId;
    private boolean available;
    private int totalReview;
    private float rating;
    private String slug;
    private Instant createdAt;
    private Instant updatedAt;
    private Double distance;
    private Double duration;
    private List<ProductSizeResponse> productSizes;
}
