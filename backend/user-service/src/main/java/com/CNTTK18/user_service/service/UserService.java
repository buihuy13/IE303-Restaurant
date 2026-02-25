package com.CNTTK18.user_service.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.CNTTK18.user_service.dto.UserRole;
import com.CNTTK18.user_service.dto.request.Register;
import com.CNTTK18.user_service.dto.request.UserRequest;
import com.CNTTK18.user_service.dto.response.AddressResponse;
import com.CNTTK18.user_service.dto.response.UserResponse;

public interface UserService {
    Page<UserResponse> getAllUsers(Pageable pageable);

    UserResponse getUserById(UUID id);

    UserResponse updateUser(UUID id, UserRequest user, UserRole authUser);

    void createUser(UUID id, Register registeredUser);

    UserResponse getUserBySlug(String slug);

    void deleteUserById(UUID id, UserRole authUser);

    List<AddressResponse> getAllAddress(UUID id);
}
