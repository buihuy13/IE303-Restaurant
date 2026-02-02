package com.CNTTK18.auth_service.dto.response;

import java.time.ZonedDateTime;
import java.util.UUID;

import com.CNTTK18.auth_service.model.data.AuthProvider;
import com.CNTTK18.auth_service.model.data.Role;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private boolean enabled;
    private Role role;
    private ZonedDateTime activatedAt;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private AuthProvider authProvider;
}
