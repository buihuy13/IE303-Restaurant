package com.CNTTK18.restaurant_service.dto.restaurant.response;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import com.CNTTK18.restaurant_service.dto.category.response.CategoryResponse;
import com.CNTTK18.restaurant_service.dto.product.response.ProductResponse;

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
public class ResResponseWithProduct {
    private UUID id;
    private String resName;
    private String address;
    private Double longitude; // kinh độ
    private Double latitude; // vĩ độ
    private Float rating;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private String phone;
    private String imageURL;
    private UUID merchantId;
    private boolean enabled;
    private int totalReview;
    private Double distance;
    private Double duration;
    private String slug;
    private Instant createdAt;
    private Instant updatedAt;
    private List<ProductResponse> products;
    private List<CategoryResponse> cate;
}
