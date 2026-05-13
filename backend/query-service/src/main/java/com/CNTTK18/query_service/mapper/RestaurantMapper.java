package com.CNTTK18.query_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.CNTTK18.query_service.dto.response.RestaurantWithDistanceResponse;
import com.CNTTK18.query_service.model.RestaurantReadModel;

@Mapper(componentModel = "spring")
public interface RestaurantMapper {
    @Mapping(target = "resName", source = "restaurant.name")
    @Mapping(target = "imageURL", source = "restaurant.imageUrl")
    @Mapping(target = "totalReview", source = "restaurant.reviewCount")
    @Mapping(target = "distance", source = "distance")
    @Mapping(target = "duration", source = "duration")
    RestaurantWithDistanceResponse toRestaurantResponse(
            RestaurantReadModel restaurant, Double distance, Double duration);
}
