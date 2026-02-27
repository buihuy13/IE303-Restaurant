package com.CNTTK18.user_service.mapper;

import org.mapstruct.Mapper;

import com.CNTTK18.user_service.dto.response.AddressResponse;
import com.CNTTK18.user_service.model.Address;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    AddressResponse toAddressResponse(Address address);
}
