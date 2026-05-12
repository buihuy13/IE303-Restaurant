package com.CNTTK18.query_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.CNTTK18.query_service.dto.response.ProductWithDistanceResponse;
import com.CNTTK18.query_service.model.ProductReadModel;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(target = "productName", source = "name")
    @Mapping(target = "imageURL", source = "imageUrl")
    @Mapping(target = "totalReview", source = "reviewCount")
    @Mapping(target = "distance", source = "distance")
    @Mapping(target = "duration", source = "duration")
    ProductWithDistanceResponse toProductResponse(ProductReadModel product, Double distance, Double duration);
}