package com.CNTTK18.restaurant_service.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.CNTTK18.restaurant_service.model.data.ReviewType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "reviews")
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Reviews {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "review_id")
    private UUID reviewId; // Id của product hoặc restaurant

    @Column(name = "review_type")
    private ReviewType reviewType; // "PRODUCT" hoặc "RESTAURANT"

    private String title;
    private String content;
    private float rating;

    @Column(name = "created_at")
    @CreatedDate
    private Instant createdAt;
}
