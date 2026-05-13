package com.CNTTK18.product_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CNTTK18.product_service.model.ProductSize;

@Repository
public interface ProductSizeRepository extends JpaRepository<ProductSize, UUID> {
    List<ProductSize> findByProductId(UUID productId);

    List<ProductSize> findBySizeId(UUID sizeId);

    Optional<ProductSize> findByProductIdAndSizeId(UUID productId, UUID sizeId);

    void deleteByProductIdAndSizeId(UUID productId, UUID sizeId);
}
