package com.CNTTK18.review_service.dto.review.response;

import java.time.ZonedDateTime;
import java.util.UUID;

import com.CNTTK18.review_service.model.data.ReviewType;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.ZonedDateTimeSerializer;

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
public class ReviewResponse {
    private UUID id;
    private UUID userId;
    private UUID reviewId;
    private ReviewType reviewType;
    private String title;
    private String content;
    private Float rating;

    @JsonSerialize(using = ZonedDateTimeSerializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private ZonedDateTime createdAt;

    @JsonSerialize(using = ZonedDateTimeSerializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private ZonedDateTime updatedAt;
}
