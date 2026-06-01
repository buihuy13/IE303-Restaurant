package com.CNTTK18.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.CNTTK18.product_service.model.Products;

@Repository
public interface ProductRepository extends JpaRepository<Products, UUID>, JpaSpecificationExecutor<Products> {

    @Query("SELECT COUNT(p) FROM Products p WHERE p.categoryId = :cateId AND p.restaurantId = :resId")
    Long countProductWithCateIdWithInRes(@Param("cateId") UUID cateId, @Param("resId") UUID resId);

    Optional<Products> findProductById(UUID id);

    List<Products> findProductsByRestaurantId(UUID restaurantId);

    Optional<Products> findBySlug(String slug);

    @Query("SELECT DISTINCT p FROM Products p " + "LEFT JOIN FETCH p.productSizes ps " + "WHERE p.id IN :ids")
    List<Products> findByIdIn(List<UUID> ids);
}
