package com.CNTTK18.restaurant_service.dto.product.response;

import java.time.Instant;
import java.util.List;

import com.CNTTK18.restaurant_service.dto.productSize.response.ProductSizeResponse;
import com.fasterxml.jackson.annotation.JsonInclude;

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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductResponseWithoutRes {
    private String id;
    private String productName;
    private String description;
    private String imageURL;
    private String categoryName;
    private String categoryId;
    private boolean available;
    private int totalReview;
    private float rating;
    private String slug;
    private Instant createdAt;
    private Instant updatedAt;
    private List<ProductSizeResponse> productSizes;
}
