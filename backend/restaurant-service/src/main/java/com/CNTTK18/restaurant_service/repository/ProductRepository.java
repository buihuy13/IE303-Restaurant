package com.CNTTK18.restaurant_service.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.CNTTK18.restaurant_service.dto.product.ProductIdWithRating;
import com.CNTTK18.restaurant_service.model.Products;
import com.CNTTK18.restaurant_service.model.Restaurants;

@Repository
public interface ProductRepository extends JpaRepository<Products, UUID>, JpaSpecificationExecutor<Products> {

    @Query(
            "SELECT COUNT(p) FROM Products p JOIN p.category c JOIN p.restaurant r WHERE c.id = :cateId AND r.id = :resId")
    Long countProductWithCateIdWithInRes(@Param("cateId") UUID cateId, @Param("resId") UUID resId);

    Optional<Products> findProductById(UUID id);

    Optional<List<Products>> findProductsByRestaurant(Restaurants res);

    Optional<Products> findBySlug(String slug);

    // Nhận projection để tránh N+1 problem
    @Query(
            value =
                    """
        SELECT DISTINCT ON (p.id)
            p.id,
            p.rating
        FROM products p
        JOIN restaurants r ON p.restaurant_id = r.id
        JOIN categories c ON c.id = p.category_id
        JOIN product_sizes ps ON ps.product_id = p.id
        WHERE r.enabled = true
        AND ST_DWithin(
            r.geom::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            :maxDistance
        )
        AND (:search IS NULL OR LOWER(p.product_name) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:categories IS NULL OR LOWER(c.cate_name) LIKE LOWER(CONCAT('%', :categories, '%')))
        AND (:minPrice IS NULL OR ps.price >= :minPrice)
        AND (:maxPrice IS NULL OR ps.price <= :maxPrice)
        ORDER BY
            p.id,
            CASE WHEN :sort = 'rating_id_desc' THEN p.rating END DESC
            """,
            countQuery =
                    """
        SELECT COUNT(DISTINCT p.id)
        FROM products p
        JOIN restaurants r ON p.restaurant_id = r.id
        JOIN categories c ON c.id = p.category_id
        JOIN product_sizes ps ON ps.product_id = p.id
        WHERE r.enabled = true
        AND ST_DWithin(
            r.geom::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            :maxDistance
        )
        AND (:search IS NULL OR LOWER(p.product_name) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:categories IS NULL OR LOWER(c.cate_name) LIKE LOWER(CONCAT('%', :categories, '%')))
        AND (:minPrice IS NULL OR ps.price >= :minPrice)
        AND (:maxPrice IS NULL OR ps.price <= :maxPrice)
        """,
            nativeQuery = true)
    Page<ProductIdWithRating> findProductsWithinDistance(
            @Param("longitude") Double longitude,
            @Param("latitude") Double latitude,
            @Param("maxDistance") Integer maxDistance,
            @Param("search") String search,
            @Param("categories") String categories,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minPrice") BigDecimal minPrice,
            @Param("sort") String sort,
            Pageable pageable);

    @Query("SELECT DISTINCT p FROM Products p "
            + "LEFT JOIN FETCH p.restaurant r "
            + // Lấy luôn Danh mục của Món ăn
            "LEFT JOIN FETCH p.productSizes ps "
            + "LEFT JOIN FETCH ps.size "
            + "LEFT JOIN FETCH p.category "
            + // Lấy luôn bảng nối ProductSize
            "WHERE p.id IN :ids")
    List<Products> findByIdIn(List<UUID> ids);
}
