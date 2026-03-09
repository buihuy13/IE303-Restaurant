package com.CNTTK18.restaurant_service.dto.review.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.CNTTK18.restaurant_service.model.data.ReviewType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    @NotNull(message = "userId is required")
    private UUID userId;

    @NotNull(message = "Id of restaurant or product is required")
    private UUID reviewId;

    @NotBlank(message = "Type should be PRODUCT or RESTAURANT")
    private ReviewType reviewType;

    @NotBlank(message = "Title is required")
    @Size(max = 100)
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    @NotNull(message = "Rating is required")
    private float rating;
}
