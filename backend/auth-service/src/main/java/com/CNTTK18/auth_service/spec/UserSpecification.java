package com.CNTTK18.auth_service.spec;

import java.security.AuthProvider;

import org.springframework.data.jpa.domain.Specification;

import com.CNTTK18.auth_service.model.Users;
import com.CNTTK18.auth_service.model.data.Role;

public class UserSpecification {
    public static Specification<Users> hasRole(Role role) {
        return (root, query, criteriaBuilder) -> {
            if (role == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("role"), role);
        };
    }

    public static Specification<Users> isEnabled(Boolean isEnabled) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("enabled"), isEnabled);
    }

    public static Specification<Users> hasAuthProvider(AuthProvider authProvider) {
        return (root, query, criteriaBuilder) -> {
            if (authProvider == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("authProvider"), authProvider);
        };
    }

    public static Specification<Users> allSpecification(
            Role role, Boolean isEnabled, AuthProvider authProvider) {
        return Specification.allOf(hasRole(role))
                .and(isEnabled(isEnabled))
                .and(hasAuthProvider(authProvider));
    }
}
