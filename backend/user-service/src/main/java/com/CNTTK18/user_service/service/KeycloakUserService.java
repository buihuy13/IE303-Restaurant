package com.CNTTK18.user_service.service;

import com.CNTTK18.user_service.dto.request.DeleteKeycloakUser;
import com.CNTTK18.user_service.dto.request.Register;
import com.CNTTK18.user_service.dto.request.UpdateKeycloakUser;
import com.CNTTK18.user_service.dto.response.RegisterResponse;

public interface KeycloakUserService {
    RegisterResponse registerWithKeyCloak(Register user);

    void updateKeycloakUser(UpdateKeycloakUser user);

    void deleteKeycloakUser(DeleteKeycloakUser user);
}
