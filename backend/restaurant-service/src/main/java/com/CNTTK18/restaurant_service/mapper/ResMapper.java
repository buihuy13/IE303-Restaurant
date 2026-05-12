package com.CNTTK18.restaurant_service.mapper;

import org.mapstruct.Mapper;

import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponse;
import com.CNTTK18.restaurant_service.model.Restaurants;

@Mapper(componentModel = "spring")
public interface ResMapper {
    ResResponse toResResponse(Restaurants res);
}
