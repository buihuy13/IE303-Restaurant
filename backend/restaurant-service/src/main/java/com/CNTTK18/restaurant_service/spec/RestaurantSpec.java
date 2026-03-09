package com.CNTTK18.restaurant_service.spec;

import java.util.List;

import jakarta.persistence.criteria.Join;

import org.springframework.data.jpa.domain.Specification;

import com.CNTTK18.restaurant_service.model.Categories;
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

    public static Specification<Restaurants> hasCategory(List<String> categories) {
        return (root, query, criteriaBuilder) -> {
            if (categories == null || categories.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            Join<Restaurants, Categories> categoryJoin = root.join("categories");
            return criteriaBuilder.lower(categoryJoin.get("cateName")).in(categories);
        };
    }

    public static Specification<Restaurants> allSpecification(String name, Boolean enabled, List<String> categories) {
        return Specification.allOf(hasNameLike(name)).and(isEnabled(enabled)).and(hasCategory(categories));
    }
}
