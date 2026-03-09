package com.CNTTK18.recommendation_service.dto.request;

import java.util.UUID;

import com.CNTTK18.recommendation_service.dto.ReviewType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReviewRequest {
    private UUID id;
    private ReviewType rvType;
}
