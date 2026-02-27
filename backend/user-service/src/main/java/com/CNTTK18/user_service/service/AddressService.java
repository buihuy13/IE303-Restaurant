package com.CNTTK18.user_service.service;

import java.util.UUID;

import com.CNTTK18.user_service.dto.UserRole;
import com.CNTTK18.user_service.dto.request.AddressRequest;
import com.CNTTK18.user_service.dto.response.AddressResponse;

public interface AddressService {
    public AddressResponse createAddress(AddressRequest address, UserRole authUser);

    public AddressResponse getAddressById(UUID id);

    public void deleteAddressById(UUID id, UserRole authUser);
}
