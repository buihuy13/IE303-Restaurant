package com.CNTTK18.restaurant_service.model;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "restaurants")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Restaurants {
    @Id
    private UUID id;

    @Column(name = "res_name", nullable = false)
    private String resName;

    private String address;
    private double longitude;
    private double latitude;

    @Builder.Default
    private float rating = 0f;

    @Column(name = "opening_time", nullable = false)
    private LocalTime openingTime;

    @Column(name = "closing_time", nullable = false)
    private LocalTime closingTime;

    private String phone;

    @Column(name = "image_url")
    private String imageURL;

    @Column(name = "public_id")
    private String publicID;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    private boolean enabled;

    @Column(name = "total_review")
    @Builder.Default
    private int totalReview = 0;

    private String slug;

    @Column(name = "created_at")
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private Instant updatedAt;
}
