package com.CNTTK18.user_service.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.SlugGenerator;
import com.CNTTK18.user_service.dto.request.UserRequest;
import com.CNTTK18.user_service.dto.response.UserResponse;
import com.CNTTK18.user_service.mapper.UserMapper;
import com.CNTTK18.user_service.model.Users;
import com.CNTTK18.user_service.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toUserResponse);
    }

    public UserResponse getUserById(UUID id) {
        Users user = getById(id);
        return userMapper.toUserResponse(user);
    }

    public UserResponse updateUser(UUID id, UserRequest user) {
        Users existingUser = getById(id);
        existingUser.setUsername(user.getUsername());
        existingUser.setSlug(SlugGenerator.generate(user.getUsername()));
        existingUser.setPhone(user.getPhone());
        existingUser = userRepository.save(existingUser);
        return userMapper.toUserResponse(existingUser);
    }

    public UserResponse getUserBySlug(String slug) {
        return userRepository
                .findBySlug(slug)
                .map(userMapper::toUserResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public void deleteUserById(UUID id) {
        userRepository.deleteById(id);
    }

    private Users getById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
