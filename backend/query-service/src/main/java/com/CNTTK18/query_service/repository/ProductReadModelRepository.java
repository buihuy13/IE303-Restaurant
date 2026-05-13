package com.CNTTK18.query_service.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.CNTTK18.query_service.model.ProductReadModel;

@Repository
public interface ProductReadModelRepository extends JpaRepository<ProductReadModel, UUID> {

    List<ProductReadModel> findByRestaurantId(UUID restaurantId);

    @Query(
            value =
                    """
        SELECT p.*
        FROM product_read_model p
        WHERE ST_DWithin(
            p.geom::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            :maxDistance
        )
        AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:categories IS NULL OR LOWER(p.category_name) LIKE LOWER(CONCAT('%', :categories, '%')))
        AND (:minPrice IS NULL OR p.min_price >= :minPrice)
        AND (:maxPrice IS NULL OR p.max_price <= :maxPrice)
        ORDER BY
            p.id,
            CASE WHEN :sort = 'rating_id_desc' THEN p.rating END DESC
            """,
            countQuery =
                    """
        SELECT COUNT(DISTINCT p.id)
        FROM product_read_model p
        WHERE ST_DWithin(
            p.geom::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            :maxDistance
        )
        AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:categories IS NULL OR LOWER(p.category_name) LIKE LOWER(CONCAT('%', :categories, '%')))
        AND (:minPrice IS NULL OR p.min_price >= :minPrice)
        AND (:maxPrice IS NULL OR p.max_price <= :maxPrice)
        """,
            nativeQuery = true)
    Page<ProductReadModel> findProductsWithinDistance(
            @Param("longitude") Double longitude,
            @Param("latitude") Double latitude,
            @Param("maxDistance") Integer maxDistance,
            @Param("search") String search,
            @Param("categories") String categories,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minPrice") BigDecimal minPrice,
            @Param("sort") String sort,
            Pageable pageable);
}
