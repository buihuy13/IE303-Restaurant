package com.CNTTK18.user_service.service.Impl;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import jakarta.ws.rs.NotFoundException;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.SlugGenerator;
import com.CNTTK18.user_service.dto.UserRole;
import com.CNTTK18.user_service.dto.request.DeleteKeycloakUser;
import com.CNTTK18.user_service.dto.request.Register;
import com.CNTTK18.user_service.dto.request.UpdateKeycloakUser;
import com.CNTTK18.user_service.dto.request.UserRequest;
import com.CNTTK18.user_service.dto.response.AddressResponse;
import com.CNTTK18.user_service.dto.response.UserResponse;
import com.CNTTK18.user_service.dto.response.UserSummaryDTO;
import com.CNTTK18.user_service.exception.ForbiddenException;
import com.CNTTK18.user_service.mapper.AddressMapper;
import com.CNTTK18.user_service.mapper.UserMapper;
import com.CNTTK18.user_service.model.Users;
import com.CNTTK18.user_service.repository.UserRepository;
import com.CNTTK18.user_service.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final Keycloak keycloak;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final AddressMapper addressMapper;

    @Value("${keycloak.realm}")
    private String realm;

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toUserResponse);
    }

    @Override
    public UserResponse getUserById(UUID id) {
        Optional<Users> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            return userMapper.toUserResponse(createUserIfNotExist(id));
        }
        return userMapper.toUserResponse(optionalUser.get());
    }

    @Transactional
    @Override
    public UserResponse updateUser(UUID id, UserRequest user, UserRole authUser) {
        checkAuthority(id, authUser);
        Users existingUser = getById(id);
        existingUser.setPhone(user.getPhone());
        if (!existingUser.getUsername().equals(user.getUsername())) {
            existingUser.setUsername(user.getUsername());
            existingUser.setSlug(SlugGenerator.generate(user.getUsername()));
            eventPublisher.publishEvent(new UpdateKeycloakUser(id.toString(), user.getUsername()));
        }
        existingUser = userRepository.save(existingUser);
        return userMapper.toUserResponse(existingUser);
    }

    @Override
    public UserResponse getUserBySlug(String slug) {
        return userRepository
                .findBySlug(slug)
                .map(userMapper::toUserResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public UserResponse getUserByAccessToken(UserRole authUser) {
        if (authUser == null || authUser.getUserId().toString().isBlank()) {
            throw new ResourceNotFoundException("Cannot recognize user id");
        }
        UUID id = authUser.getUserId();
        Optional<Users> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            return userMapper.toUserResponse(createUserIfNotExist(id));
        }
        return userMapper.toUserResponse(optionalUser.get());
    }

    @Override
    public Page<UserSummaryDTO> getAdminUsers(int page, int size, String role, String keyword) {
        int safePage = Math.max(page, 0);
        int safeSize = size > 0 ? size : 10;

        Specification<Users> spec = buildKeywordSpec(keyword);
        List<Users> users = userRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));

        String normalizedRole = Optional.ofNullable(role)
                .map(String::trim)
                .map(String::toUpperCase)
                .orElse(null);

        List<UserSummaryDTO> summaries = users.stream()
                .map(this::toUserSummary)
                .filter(summary -> normalizedRole == null || normalizedRole.equals(summary.getRole()))
                .toList();

        int fromIndex = safePage * safeSize;
        if (fromIndex >= summaries.size()) {
            return new PageImpl<>(List.of(), PageRequest.of(safePage, safeSize), summaries.size());
        }

        int toIndex = Math.min(fromIndex + safeSize, summaries.size());
        return new PageImpl<>(
                summaries.subList(fromIndex, toIndex), PageRequest.of(safePage, safeSize), summaries.size());
    }

    @Override
    @Transactional
    public void deleteUserById(UUID id, UserRole authUser) {
        checkAuthority(id, authUser);
        eventPublisher.publishEvent(new DeleteKeycloakUser(id.toString()));
        userRepository.deleteById(id);
    }

    @Transactional
    @Override
    public void createUser(UUID id, Register user) {
        Users newUser = new Users();
        newUser.setId(id);
        newUser.setUsername(user.getUsername());
        newUser.setSlug(SlugGenerator.generate(user.getUsername()));
        newUser.setEmail(user.getEmail());
        newUser.setPhone(user.getPhone());
        newUser = userRepository.save(newUser);
    }

    @Override
    public List<AddressResponse> getAllAddress(UUID id, UserRole authUser) {
        checkAuthority(id, authUser);
        Users user = getById(id);
        return user.getAddressList().stream()
                .map(addressMapper::toAddressResponse)
                .toList();
    }

    private Users getById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void checkAuthority(UUID id, UserRole authUser) {
        if (authUser != null && !authUser.getUserId().equals(id) && !"ADMIN".equals(authUser.getRole())) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }
    }

    private Users createUserIfNotExist(UUID id) {
        try {
            UserResource userResource = keycloak.realm(realm).users().get(id.toString());

            UserRepresentation user = userResource.toRepresentation();
            Users newUser = Users.builder()
                    .id(id)
                    .username(user.getUsername())
                    .slug(SlugGenerator.generate(user.getUsername()))
                    .email(user.getEmail())
                    .build();
            return userRepository.save(newUser);
        } catch (NotFoundException e) {
            throw new ResourceNotFoundException("User not found");
        }
    }

    private Specification<Users> buildKeywordSpec(String keyword) {
        String normalizedKeyword = Optional.ofNullable(keyword)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(String::toLowerCase)
                .orElse(null);

        if (normalizedKeyword == null) {
            return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        }

        return (root, query, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("username")), "%" + normalizedKeyword + "%"),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), "%" + normalizedKeyword + "%"));
    }

    private UserSummaryDTO toUserSummary(Users user) {
        String fullName = user.getUsername();
        String role = "USER";
        boolean isActive = true;

        try {
            UserResource userResource =
                    keycloak.realm(realm).users().get(user.getId().toString());
            UserRepresentation representation = userResource.toRepresentation();

            fullName = buildFullName(
                    representation.getFirstName(),
                    representation.getLastName(),
                    Optional.ofNullable(representation.getUsername()).orElse(user.getUsername()));
            isActive = representation.isEnabled();

            List<String> roleNames = userResource.roles().realmLevel().listAll().stream()
                    .map(RoleRepresentation::getName)
                    .map(String::toUpperCase)
                    .collect(Collectors.toList());
            role = resolveRole(roleNames);
        } catch (Exception ex) {
            log.error("Cannot enrich Keycloak metadata for user {}", user.getId(), ex);
        }

        return UserSummaryDTO.builder()
                .id(user.getId())
                .fullName(fullName)
                .email(user.getEmail())
                .role(role)
                .createdAt(user.getCreatedAt())
                .isActive(isActive)
                .build();
    }

    private String buildFullName(String firstName, String lastName, String fallback) {
        String first = Optional.ofNullable(firstName).map(String::trim).orElse("");
        String last = Optional.ofNullable(lastName).map(String::trim).orElse("");

        String fullName = (first + " " + last).trim();
        return fullName.isBlank() ? fallback : fullName;
    }

    private String resolveRole(List<String> roleNames) {
        if (roleNames.contains("ADMIN")) {
            return "ADMIN";
        }
        if (roleNames.contains("MERCHANT")) {
            return "MERCHANT";
        }
        if (roleNames.contains("USER")) {
            return "USER";
        }
        return roleNames.isEmpty() ? "USER" : roleNames.get(0);
    }
}
