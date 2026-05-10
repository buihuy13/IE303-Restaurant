package com.CNTTK18.restaurant_service.dto.review.response;

import java.util.List;

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
public class ReviewListResponse {
    private List<ReviewResponse> reviews;
    private Integer total;
}
