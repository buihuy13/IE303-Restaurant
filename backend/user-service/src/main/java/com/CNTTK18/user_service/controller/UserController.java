package com.CNTTK18.user_service.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.user_service.dto.UserRole;
import com.CNTTK18.user_service.dto.request.AddressRequest;
import com.CNTTK18.user_service.dto.request.Register;
import com.CNTTK18.user_service.dto.request.UserRequest;
import com.CNTTK18.user_service.dto.response.AddressResponse;
import com.CNTTK18.user_service.dto.response.MessageResponse;
import com.CNTTK18.user_service.dto.response.RegisterResponse;
import com.CNTTK18.user_service.dto.response.UserResponse;
import com.CNTTK18.user_service.dto.response.UserSummaryDTO;
import com.CNTTK18.user_service.exception.ForbiddenException;
import com.CNTTK18.user_service.service.AddressService;
import com.CNTTK18.user_service.service.KeycloakUserService;
import com.CNTTK18.user_service.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    private final UserService userService;
    private final KeycloakUserService keycloakUserService;
    private final AddressService addressService;

    @Tag(name = "Get")
    @Operation(summary = "Get all users")
    @GetMapping("")
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get user by ID")
    @GetMapping("/admin/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get admin users with filters")
    @GetMapping("/admin")
    public ResponseEntity<Page<UserSummaryDTO>> getAdminUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String keyword) {
        requireAdminRole();
        return ResponseEntity.ok(userService.getAdminUsers(page, size, role, keyword));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get user by slug")
    @GetMapping("/{slug}")
    public ResponseEntity<UserResponse> getUserBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(userService.getUserBySlug(slug));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get user by access token")
    @GetMapping("/accesstoken")
    public ResponseEntity<UserResponse> getUserByAccessToken(@AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(userService.getUserByAccessToken(authUser));
    }

    @Tag(name = "Put")
    @Operation(summary = "Update user")
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID id,
            @RequestBody @Valid UserRequest updateUserDTO,
            @AuthenticationPrincipal UserRole authUser) {

        UserResponse updatedUser = userService.updateUser(id, updateUserDTO, authUser);
        return ResponseEntity.ok(updatedUser);
    }

    @Tag(name = "Delete")
    @Operation(summary = "Delete user")
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteUser(
            @PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        userService.deleteUserById(id, authUser);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }

    @Tag(name = "Post")
    @Operation(summary = "Register")
    @PostMapping("/register")
    public ResponseEntity<Object> registerWithKeycloak(@RequestBody @Valid Register user) {
        RegisterResponse response = keycloakUserService.registerWithKeyCloak(user);
        return ResponseEntity.status(response.getStatusCode()).body(new MessageResponse(response.getMessage()));
    }

    @Tag(name = "Post")
    @Operation(summary = "Added new address for user")
    @PostMapping("/address")
    public ResponseEntity<AddressResponse> addNewAddress(
            @RequestBody @Valid AddressRequest addressRequest, @AuthenticationPrincipal UserRole authUser) {
        return new ResponseEntity<>(
                addressService.createAddress(addressRequest, authUser), HttpStatusCode.valueOf(201));
    }

    @Tag(name = "Delete")
    @Operation(summary = "Delete address")
    @DeleteMapping("/address/{id}")
    public ResponseEntity<MessageResponse> deleteAddress(
            @PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        addressService.deleteAddressById(id, authUser);
        return ResponseEntity.ok(new MessageResponse("Delete successfully"));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get user addresses")
    @GetMapping("/addresses/{id}")
    public ResponseEntity<List<AddressResponse>> getUserAddresses(
            @PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        List<AddressResponse> addresses = userService.getAllAddress(id, authUser);
        return ResponseEntity.ok(addresses);
    }

    private void requireAdminRole() {
        Object principal = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getPrincipal()
                : null;

        if (!(principal instanceof UserRole userRole)) {
            log.error("Missing user role principal in SecurityContext");
            throw new ForbiddenException("Access denied");
        }

        if (!"ADMIN".equals(userRole.getRole())) {
            log.error("Access denied for role: {}", userRole.getRole());
            throw new ForbiddenException("Access denied");
        }
    }
}
