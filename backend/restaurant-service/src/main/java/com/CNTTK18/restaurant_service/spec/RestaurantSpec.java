package com.CNTTK18.restaurant_service.spec;

import org.springframework.data.jpa.domain.Specification;

import com.CNTTK18.restaurant_service.model.Restaurants;

public class RestaurantSpec {
    public static Specification<Restaurants> hasNameLike(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("resName")), "%" + name + "%");
        };
    }

    public static Specification<Restaurants> isEnabled(Boolean enabled) {
        return (root, query, criteriaBuilder) -> {
            if (enabled == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("enabled"), enabled);
        };
    }

    public static Specification<Restaurants> allSpecification(String name, Boolean enabled) {
        return Specification.allOf(hasNameLike(name)).and(isEnabled(enabled));
    }
}
