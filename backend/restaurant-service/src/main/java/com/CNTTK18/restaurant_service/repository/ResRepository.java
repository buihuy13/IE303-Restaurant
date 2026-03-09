package com.CNTTK18.restaurant_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.CNTTK18.restaurant_service.model.Restaurants;

@Repository
public interface ResRepository extends JpaRepository<Restaurants, UUID>, JpaSpecificationExecutor<Restaurants> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Restaurants> findRestaurantById(UUID id);

    Optional<List<Restaurants>> findRestaurantsByMerchantId(UUID id);

    Optional<Restaurants> findBySlug(String slug);

    // FE chưa dùng nên chưa cần xử lý N+1
    @Query(
            value =
                    """
        SELECT DISTINCT r.*
        FROM restaurants r
        JOIN restaurant_categories rc ON r.id = rc.restaurant_id
        JOIN categories c ON c.id = rc.category_id
        WHERE r.enabled = true
        AND (:search IS NULL OR LOWER(r.res_name) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:#{#categories.size()} = 0 OR LOWER(c.cate_name) IN :categories)
        AND ST_DWithin(
            r.geom::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            :maxDistance
        )
        """,
            countQuery =
                    """
        SELECT COUNT(DISTINCT r.id)
        FROM restaurants r
        JOIN restaurant_categories rc ON r.id = rc.restaurant_id
        JOIN categories c ON c.id = rc.category_id
        WHERE r.enabled = true
        AND (:search IS NULL OR LOWER(r.res_name) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:#{#categories.size()} = 0 OR LOWER(c.cate_name) IN :categories)
        AND ST_DWithin(
            r.geom::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            :maxDistance
        )
        """,
            nativeQuery = true)
    Page<Restaurants> findRestaurantsWithinDistance(
            @Param("longitude") Double longitude,
            @Param("latitude") Double latitude,
            @Param("maxDistance") Integer maxDistance,
            @Param("search") String search,
            @Param("categories") List<String> categories,
            Pageable pageable);
}
