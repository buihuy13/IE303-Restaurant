package com.CNTTK18.restaurant_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponse;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponseWithProduct;
import com.CNTTK18.restaurant_service.model.Restaurants;

@Mapper(componentModel = "spring", uses = {CateMapper.class, ProductMapper.class})
public interface ResMapper {
    @Mapping(target = "cate", source = "categories")
    ResResponse toResResponse(Restaurants res);

    @Mapping(target = "cate", source = "categories")
    @Mapping(target = "distance", source = "distance")
    @Mapping(target = "duration", source = "duration")
    ResResponse toResResponseWithDistanceAndDuration(Restaurants res, Double distance, Double duration);

    @Mapping(target = "cate", source = "categories")
    @Mapping(target = "products", source = "products")
    ResResponseWithProduct toResResponseWithProduct(Restaurants res);

    @Mapping(target = "cate", source = "categories")
    @Mapping(target = "products", source = "products")
    @Mapping(target = "distance", source = "distance")
    @Mapping(target = "duration", source = "duration")
    ResResponseWithProduct toResResponseWithProductAndDistanceAndDuration(Restaurants res, Double distance, Double duration);
}
