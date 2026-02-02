package com.CNTTK18.auth_service.controller;

import java.sql.SQLIntegrityConstraintViolationException;
import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.auth_service.dto.request.Login;
import com.CNTTK18.auth_service.dto.request.Password;
import com.CNTTK18.auth_service.dto.request.Register;
import com.CNTTK18.auth_service.dto.response.TokenResponse;
import com.CNTTK18.auth_service.dto.response.UserResponse;
import com.CNTTK18.auth_service.exception.ForbiddenException;
import com.CNTTK18.auth_service.model.UserPrinciple;
import com.CNTTK18.auth_service.model.data.Role;
import com.CNTTK18.auth_service.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    record MessageResponse(String message) {}

    @Tag(name = "Post")
    @Operation(summary = "Login")
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody @Valid Login login, HttpServletResponse response) {
        TokenResponse token = userService.login(login, response);
        return ResponseEntity.ok(token);
    }

    @Tag(name = "Post")
    @Operation(summary = "Logout")
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(HttpServletResponse response) {
        userService.logoutUser(response);
        return ResponseEntity.ok(new MessageResponse("User logged out successfully"));
    }

    @Tag(name = "Post")
    @Operation(summary = "Register")
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@RequestBody @Valid Register user) {
        userService.register(user);
        return ResponseEntity.ok(new MessageResponse("User created successfully"));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get new access token by refresh token")
    @GetMapping("/refreshtoken")
    public ResponseEntity<MessageResponse> getNewAccessToken(HttpServletRequest request) throws Exception {
        return ResponseEntity.ok(new MessageResponse(userService.refreshAccessToken(request)));
    }

    @Tag(name = "Get")
    @Operation(summary = "Confirm account")
    @GetMapping("/confirmation")
    public ResponseEntity<Void> confirmUser(@RequestParam UUID code) throws SQLIntegrityConstraintViolationException {
        userService.activateAccount(code);
        return ResponseEntity.ok().build();
    }

    @Tag(name = "Post")
    @Operation(summary = "Resend verification email for confirming account")
    @PostMapping("/email")
    public ResponseEntity<Void> reSendVerificationEmail(@RequestParam String email) {
        userService.sendVerificationEmail(email);
        return ResponseEntity.ok().build();
    }

    @Tag(name = "Get")
    @Operation(summary = "Get roles")
    @GetMapping("/roles")
    public ResponseEntity<List<String>> getRoles() {
        return ResponseEntity.ok(userService.getRoles());
    }

    @Tag(name = "Put")
    @Operation(summary = "Update password")
    @PutMapping("/password/{id}")
    public ResponseEntity<UserResponse> resetPassword(
            @AuthenticationPrincipal UserPrinciple user, @PathVariable UUID id, @RequestBody @Valid Password password) {
        String role =
                user.getAuthorities().stream().findFirst().get().getAuthority();
        if (!user.getId().equals(id) && !role.equals(Role.ADMIN.toString())) {
            throw new ForbiddenException("You are not allowed to update this user.");
        }
        UserResponse updatedUser = userService.resetPassword(password, id);
        return ResponseEntity.ok(updatedUser);
    }
}
