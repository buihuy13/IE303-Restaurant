package com.CNTTK18.user_service.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.user_service.dto.UserRole;
import com.CNTTK18.user_service.dto.request.UserRequest;
import com.CNTTK18.user_service.dto.response.MessageResponse;
import com.CNTTK18.user_service.dto.response.UserResponse;
import com.CNTTK18.user_service.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
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
    @Operation(summary = "Get user by slug")
    @GetMapping("/{slug}")
    public ResponseEntity<UserResponse> getUserBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(userService.getUserBySlug(slug));
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
}
