package com.CNTTK18.query_service.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.CNTTK18.query_service.model.RestaurantReadModel;

@Repository
public interface RestaurantReadModelRepository extends JpaRepository<RestaurantReadModel, UUID> {

    Optional<RestaurantReadModel> findBySlug(String slug);

    Optional<RestaurantReadModel> findByMerchantId(UUID merchantId);

    @Query(
            value =
                    """
        SELECT r.*
        FROM restaurant_read_model r
        WHERE (:enabled IS NULL OR r.enabled = :enabled)
        AND ST_DWithin(
            r.geom::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            :maxDistance
        )
        AND (:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY
            r.id,
            CASE WHEN :sort = 'rating_id_desc' THEN r.rating END DESC
            """,
            countQuery =
                    """
        SELECT COUNT(DISTINCT r.id)
        FROM restaurant_read_model r
        WHERE (:enabled IS NULL OR r.enabled = :enabled)
        AND ST_DWithin(
            r.geom::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            :maxDistance
        )
        AND (:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')))
        """,
            nativeQuery = true)
    Page<RestaurantReadModel> findRestaurantsWithinDistance(
            @Param("longitude") Double longitude,
            @Param("latitude") Double latitude,
            @Param("maxDistance") Integer maxDistance,
            @Param("search") String search,
            @Param("enabled") Boolean enabled,
            @Param("sort") String sort,
            Pageable pageable);
}
