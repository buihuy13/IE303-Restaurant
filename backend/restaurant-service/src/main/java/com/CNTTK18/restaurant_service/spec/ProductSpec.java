package com.CNTTK18.restaurant_service.spec;

import java.math.BigDecimal;
import java.util.List;

import jakarta.persistence.criteria.Join;

import org.springframework.data.jpa.domain.Specification;

import com.CNTTK18.restaurant_service.model.Categories;
import com.CNTTK18.restaurant_service.model.ProductSize;
import com.CNTTK18.restaurant_service.model.Products;

public class ProductSpec {
    public static Specification<Products> hasNameLike(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("productName")), "%" + name + "%");
        };
    }

    public static Specification<Products> isAvailable(Boolean available) {
        return (root, query, criteriaBuilder) -> {
            if (available == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("available"), available);
        };
    }

    private static Specification<Products> hasCategory(List<String> categories) {
        return (root, query, criteriaBuilder) -> {
            if (categories == null || categories.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            Join<Products, Categories> categoryJoin = root.join("category");
            return criteriaBuilder.lower(categoryJoin.get("cateName")).in(categories);
        };
    }

    private static Specification<Products> hasMinPrice(BigDecimal minPrice) {
        return (root, query, criteriaBuilder) -> {
            if (minPrice == null) {
                return criteriaBuilder.conjunction();
            }
            Join<Products, ProductSize> sizeJoin = root.join("productSizes");
            return criteriaBuilder.greaterThanOrEqualTo(sizeJoin.get("price"), minPrice);
        };
    }

    private static Specification<Products> hasMaxPrice(BigDecimal maxPrice) {
        return (root, query, criteriaBuilder) -> {
            if (maxPrice == null) {
                return criteriaBuilder.conjunction();
            }
            Join<Products, ProductSize> sizeJoin = root.join("productSizes");
            return criteriaBuilder.lessThanOrEqualTo(sizeJoin.get("price"), maxPrice);
        };
    }

    public static Specification<Products> allSpecification(
            String name, Boolean available, List<String> categories, BigDecimal minPrice, BigDecimal maxPrice) {
        return Specification.allOf(hasNameLike(name))
                .and(isAvailable(available))
                .and(hasCategory(categories))
                .and(hasMinPrice(minPrice))
                .and(hasMaxPrice(maxPrice));
    }
}
