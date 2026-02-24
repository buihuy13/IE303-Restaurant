package com.CNTTK18.user_service.listener;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.CNTTK18.user_service.dto.request.DeleteKeycloakUser;
import com.CNTTK18.user_service.dto.request.UpdateKeycloakUser;
import com.CNTTK18.user_service.service.KeycloakUserService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserEventListener {
    private final KeycloakUserService keycloakUserService;

    @EventListener
    public void handleUserUpdated(UpdateKeycloakUser user) {
        keycloakUserService.updateKeycloakUser(user);
    }

    @EventListener
    public void handleUserDeleted(DeleteKeycloakUser user) {
        keycloakUserService.deleteKeycloakUser(user);
    }
}
