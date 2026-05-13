package com.CNTTK18.recommendation_service.dto.review;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ReviewListResponse {
    private List<ReviewResponse> reviews;
    private Integer total;
}
