package com.CNTTK18.user_service.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.CNTTK18.user_service.dto.UserRole;
import com.CNTTK18.user_service.dto.request.UserRequest;
import com.CNTTK18.user_service.dto.response.UserResponse;

public interface UserService {
    Page<UserResponse> getAllUsers(Pageable pageable);

    UserResponse getUserById(UUID id);

    UserResponse updateUser(UUID id, UserRequest user, UserRole authUser);

    UserResponse getUserBySlug(String slug);

    void deleteUserById(UUID id, UserRole authUser);
}
