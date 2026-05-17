package com.CNTTK18.user_service.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.user_service.dto.UserRole;
import com.CNTTK18.user_service.dto.request.MerchantRegisterRequest;
import com.CNTTK18.user_service.dto.request.RejectMerchantRequest;
import com.CNTTK18.user_service.dto.response.MerchantApplicationResponse;
import com.CNTTK18.user_service.dto.response.MessageResponse;
import com.CNTTK18.user_service.dto.response.RegisterResponse;
import com.CNTTK18.user_service.exception.ForbiddenException;
import com.CNTTK18.user_service.model.data.ApplicationStatus;
import com.CNTTK18.user_service.service.MerchantApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Merchant Application endpoints:
 *
 *  POST   /api/users/merchant/register          — public: submit merchant application
 *  GET    /api/users/admin/merchants             — admin: list applications (filter by status)
 *  PUT    /api/users/admin/merchants/{id}/approve — admin: approve application
 *  PUT    /api/users/admin/merchants/{id}/reject  — admin: reject application
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Merchant Applications", description = "Merchant registration and admin approval APIs")
public class MerchantApplicationController {

    private final MerchantApplicationService merchantApplicationService;

    // ─────────────────────────────────────────────────────────────
    // PUBLIC: Submit merchant application
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/merchant/register")
    @Operation(summary = "Submit a new merchant registration application")
    public ResponseEntity<MessageResponse> applyAsMerchant(
            @RequestBody @Valid MerchantRegisterRequest request) {

        RegisterResponse result = merchantApplicationService.applyAsMerchant(request);
        HttpStatus status = HttpStatus.valueOf(result.getStatusCode());
        return ResponseEntity.status(status).body(new MessageResponse(result.getMessage()));
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN: Get all merchant applications
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/admin/merchants")
    @Operation(summary = "Get all merchant applications (admin only). Filter by status: PENDING | APPROVED | REJECTED")
    public ResponseEntity<List<MerchantApplicationResponse>> getApplications(
            @RequestParam(required = false) ApplicationStatus status,
            @AuthenticationPrincipal UserRole authUser) {

        requireAdminRole(authUser);
        return ResponseEntity.ok(merchantApplicationService.getApplications(status));
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN: Approve application
    // ─────────────────────────────────────────────────────────────
    @PutMapping("/admin/merchants/{id}/approve")
    @Operation(summary = "Approve a merchant application — enables the Keycloak account")
    public ResponseEntity<MerchantApplicationResponse> approveApplication(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserRole authUser) {

        requireAdminRole(authUser);
        return ResponseEntity.ok(merchantApplicationService.approveApplication(id));
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN: Reject application
    // ─────────────────────────────────────────────────────────────
    @PutMapping("/admin/merchants/{id}/reject")
    @Operation(summary = "Reject a merchant application — removes the Keycloak account")
    public ResponseEntity<MerchantApplicationResponse> rejectApplication(
            @PathVariable UUID id,
            @RequestBody(required = false) RejectMerchantRequest request,
            @AuthenticationPrincipal UserRole authUser) {

        requireAdminRole(authUser);
        return ResponseEntity.ok(merchantApplicationService.rejectApplication(id, request));
    }

    // ─────────────────────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────────────────────
    private void requireAdminRole(UserRole authUser) {
        if (authUser == null) {
            Object principal = SecurityContextHolder.getContext().getAuthentication() != null
                    ? SecurityContextHolder.getContext().getAuthentication().getPrincipal()
                    : null;
            if (!(principal instanceof UserRole role) || !"ADMIN".equals(role.getRole())) {
                throw new ForbiddenException("Access denied — admin role required");
            }
            return;
        }
        if (!"ADMIN".equals(authUser.getRole())) {
            throw new ForbiddenException("Access denied — admin role required");
        }
    }
}
