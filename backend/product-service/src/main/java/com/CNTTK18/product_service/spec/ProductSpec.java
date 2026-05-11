package com.CNTTK18.product_service.spec;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.criteria.Join;

import org.springframework.data.jpa.domain.Specification;

import com.CNTTK18.product_service.model.ProductSize;
import com.CNTTK18.product_service.model.Products;

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

    public static Specification<Products> hasCategoryId(UUID categoryId) {
        return (root, query, criteriaBuilder) -> {
            if (categoryId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("categoryId"), categoryId);
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
            String name, Boolean available, UUID categoryId, BigDecimal minPrice, BigDecimal maxPrice) {
        return Specification.allOf(hasNameLike(name))
                .and(isAvailable(available))
                .and(hasCategoryId(categoryId))
                .and(hasMinPrice(minPrice))
                .and(hasMaxPrice(maxPrice));
    }
}
