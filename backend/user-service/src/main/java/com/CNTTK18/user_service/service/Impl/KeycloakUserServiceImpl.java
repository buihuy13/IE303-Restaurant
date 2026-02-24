package com.CNTTK18.user_service.service.Impl;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import jakarta.ws.rs.core.Response;

import org.keycloak.admin.client.CreatedResponseUtil;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.CNTTK18.user_service.dto.request.DeleteKeycloakUser;
import com.CNTTK18.user_service.dto.request.Register;
import com.CNTTK18.user_service.dto.request.UpdateKeycloakUser;
import com.CNTTK18.user_service.dto.response.RegisterResponse;
import com.CNTTK18.user_service.service.KeycloakEmailService;
import com.CNTTK18.user_service.service.KeycloakUserService;
import com.CNTTK18.user_service.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KeycloakUserServiceImpl implements KeycloakUserService {
    private final Keycloak keycloak;
    private final UserService userService;
    private final KeycloakEmailService keycloakEmailService;

    @Value("${keycloak.realm}")
    private String realm;

    @Override
    public RegisterResponse registerWithKeyCloak(Register registeredUser) {
        UserRepresentation user = createUserRepresentation(registeredUser);
        Response response = keycloak.realm(realm).users().create(user);
        if (response.getStatus() == 201) {
            String id = CreatedResponseUtil.getCreatedId(response);
            userService.createUser(UUID.fromString(id), registeredUser);
            createPasswordAndRole(id, response, registeredUser);
        }
        return new RegisterResponse(response.getStatus(), response.readEntity(String.class));
    }

    @Override
    public void updateKeycloakUser(UpdateKeycloakUser updatedUser) {
        UserResource userResource = keycloak.realm(realm).users().get(updatedUser.getId());
        UserRepresentation user = userResource.toRepresentation();
        user.setUsername(updatedUser.getUsername());
        userResource.update(user);
    }

    @Override
    public void deleteKeycloakUser(DeleteKeycloakUser user) {
        String id = user.getId();
        Response response = keycloak.realm(realm).users().delete(id.toString());

        if (response.getStatus() != 204) {
            throw new RuntimeException("Failed to delete user from Keycloak: " + id);
        }
    }

    private UserRepresentation createUserRepresentation(Register user) {
        UserRepresentation registeredUser = new UserRepresentation();
        registeredUser.setUsername(user.getUsername());
        registeredUser.setEmail(user.getEmail());
        registeredUser.setEmailVerified(false);
        registeredUser.setEnabled(true);
        registeredUser.setRequiredActions(List.of("VERIFY_EMAIL"));
        return registeredUser;
    }

    private void createPasswordAndRole(String userId, Response response, Register registeredUser) {
        // set password
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setTemporary(false); // không bắt user đổi pass ở lần login đầu
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(registeredUser.getPassword());
        UserResource userResource = keycloak.realm(realm).users().get(userId);
        userResource.resetPassword(credential);
        // set role
        String role = registeredUser.getRole().name();
        RoleRepresentation realmRole = keycloak.realm(realm).roles().get(role).toRepresentation();
        userResource.roles().realmLevel().add(Collections.singletonList(realmRole));
        // send verification email
        keycloakEmailService.sendVerificationEmailWithKeycloak(userId);
    }
}
