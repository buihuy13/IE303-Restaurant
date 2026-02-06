package com.CNTTK18.auth_service.service;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Event.User.CreateUserDTO;
import com.CNTTK18.Common.Event.User.DeleteUserDTO;
import com.CNTTK18.Common.Event.User.UpdateUsernameDTO;
import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.auth_service.dto.request.Login;
import com.CNTTK18.auth_service.dto.request.Password;
import com.CNTTK18.auth_service.dto.request.Register;
import com.CNTTK18.auth_service.dto.response.TokenResponse;
import com.CNTTK18.auth_service.dto.response.UserResponse;
import com.CNTTK18.auth_service.exception.InactivateException;
import com.CNTTK18.auth_service.mapper.UserMapper;
import com.CNTTK18.auth_service.model.Users;
import com.CNTTK18.auth_service.model.data.AuthProvider;
import com.CNTTK18.auth_service.model.data.Role;
import com.CNTTK18.auth_service.repository.UserRepository;
import com.CNTTK18.auth_service.util.EmailValidator;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final MailService mailService;
    private final CookiesService cookiesService;
    private final UserMapper userMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void register(Register user) {
        if (!user.getPassword().equals(user.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and Confirm Password do not match");
        }
        Users newUser = new Users();
        newUser.setId(UUID.randomUUID());
        newUser.setEmail(user.getEmail());
        newUser.setUsername(user.getUsername());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        newUser.setEnabled(false);
        newUser.setVerificationCode(UUID.randomUUID());
        newUser.setRole(user.getRole());
        newUser.setAuthProvider(AuthProvider.LOCAL);
        userRepository.save(newUser);
        if (user.getRole().equals(Role.USER)) {
            mailService.sendConfirmationEmail(newUser.getUsername(), newUser.getVerificationCode());
        }
        eventPublisher.publishEvent(buildCreateUserDTO(newUser.getId(), user));
    }

    public TokenResponse login(Login user, HttpServletResponse response) {
        @SuppressWarnings("unused")
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));
        Users existingUsers = getUserAfterLogin(user.getUsername());
        if (!existingUsers.isEnabled()) {
            throw new InactivateException(
                    "Your account is not activated. Please activate your account before logging in.");
        }
        cookiesService.addRefreshTokenToCookie(
                jwtService.generateRefreshToken(user.getUsername(), existingUsers.getRole(), existingUsers.getId()),
                response);
        return new TokenResponse(
                jwtService.generateToken(user.getUsername(), existingUsers.getRole(), existingUsers.getId()));
    }

    public void logoutUser(HttpServletResponse response) {
        cookiesService.deleteRefreshTokenInCookie(response);
    }

    public String refreshAccessToken(HttpServletRequest request) throws Exception {
        String refreshToken = cookiesService.extractRefreshTokenFromCookie(request);
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new IllegalArgumentException("Refresh token is missing");
        }
        return jwtService.refreshAccessToken(refreshToken);
    }

    @Transactional
    public void activateAccount(UUID code) {
        Users user = userRepository
                .findByVerificationCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid verification code"));
        user.setEnabled(true);
        userRepository.save(user);
    }

    public void sendVerificationEmail(String email) {
        Users user = getUsersByEmail(email);
        if (user.isEnabled()) {
            throw new IllegalStateException("Account is already activated");
        }
        mailService.sendConfirmationEmail(email, user.getVerificationCode());
    }

    public List<String> getRoles() {
        return Arrays.asList(Role.USER.toString(), Role.ADMIN.toString());
    }

    @Transactional
    public UserResponse resetPassword(Password password, UUID id) {
        if (!password.getPassword().equals(password.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and Confirm Password do not match");
        }
        Users user = getUsersById(id);
        if (!passwordEncoder.matches(password.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Old Password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(password.getPassword()));
        userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    @Transactional
    @RabbitListener(queues = "DeleteUser_queue")
    public void deleteUserById(DeleteUserDTO deletedUser) {
        Users user = getUsersById(deletedUser.getId());
        userRepository.delete(user);
    }

    @Transactional
    @RabbitListener(queues = "UpdateUser_queue")
    public void updateUserName(UpdateUsernameDTO updateUserNameDTO) {
        Users user = getUsersById(updateUserNameDTO.getId());
        user.setUsername(updateUserNameDTO.getUsername());
        userRepository.save(user);
    }

    private Users getUsersById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Users getUsersByUsername(String username) {
        return userRepository
                .findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Users getUsersByEmail(String email) {
        return userRepository
                .findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Users getUserAfterLogin(String name) {
        if (EmailValidator.validate(name)) {
            return getUsersByEmail(name);
        }
        return getUsersByUsername(name);
    }

    private CreateUserDTO buildCreateUserDTO(UUID id, Register user) {
        return CreateUserDTO.builder()
                .id(id)
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .build();
    }
}
