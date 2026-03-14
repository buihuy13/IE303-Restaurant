package com.CNTTK18.restaurant_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponse;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResResponseWithProduct;
import com.CNTTK18.restaurant_service.dto.restaurant.response.ResWithDistance;
import com.CNTTK18.restaurant_service.model.Restaurants;

@Mapper(
        componentModel = "spring",
        uses = {CateMapper.class, ProductMapper.class})
public interface ResMapper {
    @Mapping(target = "cate", source = "categories")
    @Mapping(target = "distance", ignore = true)
    @Mapping(target = "duration", ignore = true)
    ResResponse toResResponse(Restaurants res);

    @Mapping(target = "cate", source = "res.categories")
    @Mapping(target = "distance", source = "distance")
    @Mapping(target = "duration", source = "duration")
    ResResponse toResResponse(Restaurants res, Double distance, Double duration);

    @Mapping(target = "distance", source = "distance")
    @Mapping(target = "duration", source = "duration")
    ResWithDistance toResResponseWithDistanceAndDuration(Restaurants res, Double distance, Double duration);

    @Mapping(target = "cate", source = "categories")
    @Mapping(target = "products", source = "products")
    @Mapping(target = "distance", ignore = true)
    @Mapping(target = "duration", ignore = true)
    ResResponseWithProduct toResResponseWithProduct(Restaurants res);

    @Mapping(target = "cate", source = "res.categories")
    @Mapping(target = "products", source = "res.products")
    @Mapping(target = "distance", source = "distance")
    @Mapping(target = "duration", source = "duration")
    ResResponseWithProduct toResResponseWithProductAndDistanceAndDuration(
            Restaurants res, Double distance, Double duration);
}
