package com.CNTTK18.user_service.service.Impl;

import java.util.UUID;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Event.User.CreateUserDTO;
import com.CNTTK18.Common.Event.User.DeleteUserDTO;
import com.CNTTK18.Common.Event.User.UpdateUsernameDTO;
import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.SlugGenerator;
import com.CNTTK18.user_service.dto.KeycloakEventDTO;
import com.CNTTK18.user_service.dto.UserRole;
import com.CNTTK18.user_service.dto.request.UserRequest;
import com.CNTTK18.user_service.dto.response.UserResponse;
import com.CNTTK18.user_service.exception.ForbiddenException;
import com.CNTTK18.user_service.mapper.UserMapper;
import com.CNTTK18.user_service.model.Users;
import com.CNTTK18.user_service.repository.UserRepository;
import com.CNTTK18.user_service.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final ApplicationEventPublisher eventPublisher;

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toUserResponse);
    }

    public UserResponse getUserById(UUID id) {
        Users user = getById(id);
        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(UUID id, UserRequest user, UserRole authUser) {
        checkAuthority(id, authUser);
        Users existingUser = getById(id);
        existingUser.setPhone(user.getPhone());
        if (!existingUser.getUsername().equals(user.getUsername())) {
            existingUser.setUsername(user.getUsername());
            existingUser.setSlug(SlugGenerator.generate(user.getUsername()));
            eventPublisher.publishEvent(builUpdateUsernameDTO(id, user.getUsername()));
        }
        existingUser = userRepository.save(existingUser);
        return userMapper.toUserResponse(existingUser);
    }

    public UserResponse getUserBySlug(String slug) {
        return userRepository
                .findBySlug(slug)
                .map(userMapper::toUserResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    @RabbitListener(queues = "CreateUser_queue")
    public void createUser(CreateUserDTO user) {
        Users newUser = new Users();
        newUser.setId(user.getId());
        newUser.setUsername(user.getUsername());
        newUser.setSlug(SlugGenerator.generate(user.getUsername()));
        newUser.setEmail(user.getEmail());
        newUser.setPhone(user.getPhone());
        newUser = userRepository.save(newUser);
    }

    @Transactional
    public void deleteUserById(UUID id, UserRole authUser) {
        checkAuthority(id, authUser);
        userRepository.deleteById(id);
        eventPublisher.publishEvent(buildDeleteUserDTO(id));
    }

    private DeleteUserDTO buildDeleteUserDTO(UUID id) {
        return DeleteUserDTO.builder().id(id).build();
    }

    private UpdateUsernameDTO builUpdateUsernameDTO(UUID id, String username) {
        return UpdateUsernameDTO.builder().id(id).username(username).build();
    }

    private Users getById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void checkAuthority(UUID id, UserRole authUser) {
        if (!authUser.getUserId().equals(id) && !"ADMIN".equals(authUser.getRole())) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }
    }

    @Override
    public void handleKeycloakEvent(KeycloakEventDTO event) {
        if ("REGISTER".equals(event.getType())) {
            syncUserFromKeycloak(event);
        }
    }

    @Transactional
    private void syncUserFromKeycloak(KeycloakEventDTO event) {
        String email = event.getDetails().get("email").toString();
        String username = event.getDetails().get("username").toString();

        Users newUser = new Users();
        newUser.setId(UUID.fromString(event.getUserId()));
        newUser.setUsername(username);
        newUser.setSlug(SlugGenerator.generate(username));
        newUser.setEmail(email);
        userRepository.save(newUser);
    }
}
