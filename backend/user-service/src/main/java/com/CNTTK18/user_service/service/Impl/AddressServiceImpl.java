package com.CNTTK18.user_service.service.Impl;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.user_service.dto.UserRole;
import com.CNTTK18.user_service.dto.request.AddressRequest;
import com.CNTTK18.user_service.dto.response.AddressResponse;
import com.CNTTK18.user_service.exception.ForbiddenException;
import com.CNTTK18.user_service.mapper.AddressMapper;
import com.CNTTK18.user_service.model.Address;
import com.CNTTK18.user_service.model.Users;
import com.CNTTK18.user_service.repository.AddressRepository;
import com.CNTTK18.user_service.repository.UserRepository;
import com.CNTTK18.user_service.service.AddressService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {
    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AddressResponse createAddress(AddressRequest address, UserRole authUser) {
        checkAuthority(address.getUserId(), authUser);
        Users user = userRepository
                .findById(address.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Address newAddress = Address.builder()
                .location(address.getLocation())
                .longitude(address.getLongitude())
                .latitude(address.getLatitude())
                .user(user)
                .build();

        addressRepository.save(newAddress);
        return addressMapper.toAddressResponse(newAddress);
    }

    @Override
    public AddressResponse getAddressById(UUID id) {
        return addressMapper.toAddressResponse(findAddressById(id));
    }

    @Override
    @Transactional
    public void deleteAddressById(UUID id, UserRole authUser) {
        checkAuthority(findAddressById(id).getUser().getId(), authUser);
        addressRepository.delete(findAddressById(id));
    }

    private Address findAddressById(UUID id) {
        return addressRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Address not found"));
    }

    private void checkAuthority(UUID id, UserRole authUser) {
        if (authUser != null && !authUser.getUserId().equals(id) && !"ADMIN".equals(authUser.getRole())) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }
    }
}
