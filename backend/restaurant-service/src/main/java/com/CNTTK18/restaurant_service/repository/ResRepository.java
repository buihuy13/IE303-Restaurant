package com.CNTTK18.restaurant_service.repository;

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

    Optional<Restaurants> findRestaurantsByMerchantId(UUID id);

    Optional<Restaurants> findBySlug(String slug);

    Optional<Restaurants> findWithCategoriesAndProductsById(UUID id);

    @Query(
            value =
                    """
        SELECT DISTINCT r.*
        FROM restaurants r
        WHERE (:enabled IS NULL OR r.enabled = :enabled)
        AND (:search IS NULL OR LOWER(r.res_name) LIKE LOWER(CONCAT('%', :search, '%')))
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
        WHERE (:enabled IS NULL OR r.enabled = :enabled)
        AND (:search IS NULL OR LOWER(r.res_name) LIKE LOWER(CONCAT('%', :search, '%')))
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
            @Param("enabled") Boolean enabled,
            Pageable pageable);
}
