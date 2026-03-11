package com.CNTTK18.recommendation_service.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReviewSummarizeResponse {
    private String summary;
    private List<String> improvements;
}
