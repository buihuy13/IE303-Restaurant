package com.CNTTK18.user_service.dto.response;

import java.time.Instant;
import java.util.UUID;

import com.CNTTK18.user_service.model.data.ApplicationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MerchantApplicationResponse {
    private UUID id;
    private UUID userId;

    // Account info
    private String username;
    private String email;
    private String phone;

    // Restaurant info
    private String resName;
    private String address;
    private Double latitude;
    private Double longitude;
    private String openingTime;
    private String closingTime;

    // Status
    private ApplicationStatus status;
    private String rejectionReason;

    private Instant createdAt;
    private Instant updatedAt;
}
