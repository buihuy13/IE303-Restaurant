package com.CNTTK18.query_service.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

import org.locationtech.jts.geom.Point;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "restaurant_read_model")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantReadModel {
    @Id
    private UUID id;

    private String name;

    private String slug;

    private String address;

    private String phone;

    @Column(name = "image_url")
    private String imageUrl;

    private boolean enabled;

    @Column(name = "opening_time")
    private LocalTime openingTime;

    @Column(name = "closing_time")
    private LocalTime closingTime;

    private Double latitude;

    private Double longitude;

    private BigDecimal rating;

    @Column(columnDefinition = "geometry(Point,4326)")
    private Point geom;

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(name = "merchant_id")
    private UUID merchantId;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
