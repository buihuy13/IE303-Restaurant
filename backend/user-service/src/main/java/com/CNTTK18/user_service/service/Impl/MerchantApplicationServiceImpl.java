package com.CNTTK18.user_service.service.Impl;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import jakarta.ws.rs.core.Response;

import org.keycloak.admin.client.CreatedResponseUtil;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.SlugGenerator;
import com.CNTTK18.user_service.dto.request.MerchantRegisterRequest;
import com.CNTTK18.user_service.dto.request.RejectMerchantRequest;
import com.CNTTK18.user_service.dto.response.MerchantApplicationResponse;
import com.CNTTK18.user_service.dto.response.RegisterResponse;
import com.CNTTK18.user_service.exception.ForbiddenException;
import com.CNTTK18.user_service.model.MerchantApplication;
import com.CNTTK18.user_service.model.Users;
import com.CNTTK18.user_service.model.data.ApplicationStatus;
import com.CNTTK18.user_service.repository.MerchantApplicationRepository;
import com.CNTTK18.user_service.repository.UserRepository;
import com.CNTTK18.user_service.service.KeycloakEmailService;
import com.CNTTK18.user_service.service.MerchantApplicationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MerchantApplicationServiceImpl implements MerchantApplicationService {

    private final Keycloak keycloak;
    private final MerchantApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final KeycloakEmailService keycloakEmailService;

    @Value("${keycloak.realm}")
    private String realm;

    // ─────────────────────────────────────────────────────────────
    // 1. Register merchant application
    // ─────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public RegisterResponse applyAsMerchant(MerchantRegisterRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return new RegisterResponse(400, "Password and confirm password do not match");
        }

        // Check duplicate email in our pending applications
        if (applicationRepository.existsByEmail(request.getEmail())) {
            return new RegisterResponse(409, "A merchant application with this email already exists");
        }

        // Step 1: Create Keycloak user with enabled=false
        UserRepresentation userRepresentation = new UserRepresentation();
        userRepresentation.setUsername(request.getUsername());
        userRepresentation.setEmail(request.getEmail());
        userRepresentation.setEmailVerified(false);
        userRepresentation.setEnabled(false); // disabled until admin approves
        userRepresentation.setRequiredActions(List.of("VERIFY_EMAIL"));

        Response response = keycloak.realm(realm).users().create(userRepresentation);

        if (response.getStatus() != 201) {
            String errorBody = response.readEntity(String.class);
            log.error("Keycloak user creation failed: status={}, body={}", response.getStatus(), errorBody);
            return new RegisterResponse(response.getStatus(), errorBody);
        }

        String keycloakUserId = CreatedResponseUtil.getCreatedId(response);

        // Step 2: Set password and assign MERCHANT role in Keycloak
        setPasswordAndMerchantRole(keycloakUserId, request.getPassword());

        // Step 3: Send verification email
        keycloakEmailService.sendVerificationEmailWithKeycloak(keycloakUserId);

        UUID userId = UUID.fromString(keycloakUserId);

        // Step 4: Save user in local DB
        Users newUser = new Users();
        newUser.setId(userId);
        newUser.setUsername(request.getUsername());
        newUser.setSlug(SlugGenerator.generate(request.getUsername()));
        newUser.setEmail(request.getEmail());
        newUser.setPhone(request.getPhone());
        userRepository.save(newUser);

        // Step 5: Save merchant application (restaurant info)
        MerchantApplication application = MerchantApplication.builder()
                .userId(userId)
                .username(request.getUsername())
                .email(request.getEmail())
                .phone(request.getPhone())
                .resName(request.getResName())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .status(ApplicationStatus.PENDING)
                .build();
        applicationRepository.save(application);

        log.info("Merchant application submitted: userId={}, email={}", userId, request.getEmail());
        return new RegisterResponse(201, "Merchant application submitted successfully. Waiting for admin approval.");
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Get applications (optionally filtered by status)
    // ─────────────────────────────────────────────────────────────
    @Override
    public List<MerchantApplicationResponse> getApplications(ApplicationStatus status) {
        List<MerchantApplication> applications = (status != null)
                ? applicationRepository.findByStatus(status)
                : applicationRepository.findAllByOrderByCreatedAtDesc();

        return applications.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Approve application
    // ─────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public MerchantApplicationResponse approveApplication(UUID applicationId) {
        MerchantApplication application = getApplicationOrThrow(applicationId);

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new ForbiddenException("Application is not in PENDING state: current status = " + application.getStatus());
        }

        // Enable user in Keycloak
        String userId = application.getUserId().toString();
        UserResource userResource = keycloak.realm(realm).users().get(userId);
        UserRepresentation userRepresentation = userResource.toRepresentation();
        userRepresentation.setEnabled(true);
        userResource.update(userRepresentation);

        // Update application status
        application.setStatus(ApplicationStatus.APPROVED);
        applicationRepository.save(application);

        log.info("Merchant application APPROVED: applicationId={}, userId={}", applicationId, userId);
        return toResponse(application);
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Reject application
    // ─────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public MerchantApplicationResponse rejectApplication(UUID applicationId, RejectMerchantRequest request) {
        MerchantApplication application = getApplicationOrThrow(applicationId);

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new ForbiddenException("Application is not in PENDING state: current status = " + application.getStatus());
        }

        String userId = application.getUserId().toString();

        // Delete user from Keycloak
        try {
            Response deleteResponse = keycloak.realm(realm).users().delete(userId);
            if (deleteResponse.getStatus() != 204) {
                log.warn("Keycloak delete returned non-204: status={}", deleteResponse.getStatus());
            }
        } catch (Exception e) {
            log.error("Failed to delete Keycloak user {}: {}", userId, e.getMessage());
        }

        // Delete user from local DB
        userRepository.findById(application.getUserId()).ifPresent(userRepository::delete);

        // Mark application as REJECTED (keep for audit purposes)
        application.setStatus(ApplicationStatus.REJECTED);
        application.setRejectionReason(request != null ? request.getReason() : null);
        applicationRepository.save(application);

        log.info("Merchant application REJECTED: applicationId={}, userId={}, reason={}",
                applicationId, userId, request != null ? request.getReason() : "no reason provided");

        return toResponse(application);
    }

    // ─────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────
    private MerchantApplication getApplicationOrThrow(UUID id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Merchant application not found: " + id));
    }

    private MerchantApplicationResponse toResponse(MerchantApplication app) {
        return MerchantApplicationResponse.builder()
                .id(app.getId())
                .userId(app.getUserId())
                .username(app.getUsername())
                .email(app.getEmail())
                .phone(app.getPhone())
                .resName(app.getResName())
                .address(app.getAddress())
                .latitude(app.getLatitude())
                .longitude(app.getLongitude())
                .openingTime(app.getOpeningTime())
                .closingTime(app.getClosingTime())
                .status(app.getStatus())
                .rejectionReason(app.getRejectionReason())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }

    private void setPasswordAndMerchantRole(String keycloakUserId, String password) {
        UserResource userResource = keycloak.realm(realm).users().get(keycloakUserId);

        // Set password
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setTemporary(false);
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        userResource.resetPassword(credential);

        // Remove default roles
        RoleRepresentation userRole = keycloak.realm(realm).roles().get("USER").toRepresentation();
        RoleRepresentation defaultComposite = keycloak.realm(realm).roles().get("default-roles-" + realm).toRepresentation();
        userResource.roles().realmLevel().remove(List.of(userRole, defaultComposite));

        // Assign MERCHANT role
        RoleRepresentation merchantRole = keycloak.realm(realm).roles().get("MERCHANT").toRepresentation();
        userResource.roles().realmLevel().add(Collections.singletonList(merchantRole));
    }
}
