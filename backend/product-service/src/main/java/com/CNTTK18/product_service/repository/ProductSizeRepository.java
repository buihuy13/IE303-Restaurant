package com.CNTTK18.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.CNTTK18.product_service.model.ProductSize;

@Repository
public interface ProductSizeRepository extends JpaRepository<ProductSize, UUID> {
    List<ProductSize> findByProductId(UUID productId);

    List<ProductSize> findBySizeId(UUID sizeId);

    Optional<ProductSize> findByProductIdAndSizeId(UUID productId, UUID sizeId);

    void deleteByProductIdAndSizeId(UUID productId, UUID sizeId);

    /**
     * Hard-delete all sizes for a product directly via JPQL to avoid the
     * JPA deferred-flush issue (orphanRemoval deletes are batched at flush time,
     * which can collide with new inserts that share the same unique constraint).
     */
    @Modifying
    @Query("DELETE FROM ProductSize ps WHERE ps.product.id = :productId")
    void deleteAllByProductId(@Param("productId") UUID productId);
}
