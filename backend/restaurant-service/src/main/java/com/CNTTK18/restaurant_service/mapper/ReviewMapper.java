package com.CNTTK18.restaurant_service.mapper;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.CNTTK18.restaurant_service.dto.review.response.ReviewResponse;
import com.CNTTK18.restaurant_service.model.Reviews;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    @Mapping(target = "createdAt", source = "createdAt", qualifiedByName = "convertToVNZone")
    ReviewResponse toReviewResponse(Reviews rv);

    @Named("convertToVNZone")
    default ZonedDateTime convertToVNZone(Instant instant) {
        if (instant == null) return null;
        return instant.atZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    }
}
