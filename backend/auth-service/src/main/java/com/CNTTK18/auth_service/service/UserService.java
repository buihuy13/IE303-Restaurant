package com.CNTTK18.auth_service.service;

import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.CNTTK18.auth_service.dto.request.Login;
import com.CNTTK18.auth_service.dto.request.Password;
import com.CNTTK18.auth_service.dto.request.Register;
import com.CNTTK18.auth_service.dto.response.TokenResponse;
import com.CNTTK18.auth_service.dto.response.UserResponse;

public interface UserService {
    void register(Register user);

    TokenResponse login(Login user, HttpServletResponse response);

    void logoutUser(HttpServletResponse response);

    String refreshAccessToken(HttpServletRequest request) throws Exception;

    void activateAccount(UUID code);

    void sendVerificationEmail(String email);

    List<String> getRoles();

    UserResponse resetPassword(Password password, UUID id);
}
