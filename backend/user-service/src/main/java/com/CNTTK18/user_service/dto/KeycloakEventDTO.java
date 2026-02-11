package com.CNTTK18.user_service.dto;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KeycloakEventDTO {
    private String type;
    private String realmId;
    private String clientId;
    private String userId;
    private String ipAddress;
    private String error;
    private Map<String, Object> details;
}
