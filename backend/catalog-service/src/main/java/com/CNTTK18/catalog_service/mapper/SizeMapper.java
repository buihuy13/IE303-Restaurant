package com.CNTTK18.catalog_service.mapper;

import org.mapstruct.Mapper;
import com.CNTTK18.catalog_service.dto.size.response.SizeResponse;
import com.CNTTK18.catalog_service.model.Size;

@Mapper(componentModel = "spring")
public interface SizeMapper {
    SizeResponse toSizeResponse(Size size);
}
