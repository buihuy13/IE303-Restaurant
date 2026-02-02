package com.CNTTK18.user_service.spec;

import org.springframework.data.jpa.domain.Specification;

import com.CNTTK18.user_service.model.Users;

public class UserSpecification {

    public static Specification<Users> hasNameLike(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(root.get("username"), "%" + name + "%");
        };
    }

    public static Specification<Users> allSpecification(
            String role, Boolean isEnabled, String name, String authProvider) {
        return Specification.allOf(hasNameLike(name));
    }
}
