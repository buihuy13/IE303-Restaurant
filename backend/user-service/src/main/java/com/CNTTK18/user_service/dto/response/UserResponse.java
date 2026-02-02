package com.CNTTK18.user_service.dto.response;

import java.time.ZonedDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String username;
    private String email;
    private String phone;
    private String slug;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
