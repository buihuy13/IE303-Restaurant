package com.CNTTK18.restaurant_service.model;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Products {
    @Id
    private UUID id;

    @Column(name = "product_name", nullable = false)
    private String productName;

    private String description;

    @Column(name = "image_url")
    private String imageURL;

    @Column(name = "public_id")
    private String publicID; // Cho việc xóa ảnh trong cloud

    @Column(name = "category_id")
    private UUID categoryId;

    private boolean available;

    @Builder.Default
    private float rating = 0f;

    @Column(name = "total_review")
    @Builder.Default
    private int totalReview = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurants restaurant;

    private String slug;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ProductSize> productSizes = new HashSet<>();

    @Column(name = "created_at")
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private Instant updatedAt;

    // Helper methods
    public void addProductSize(ProductSize productSize) {
        if (this.productSizes == null) {
            this.productSizes = new HashSet<>();
        }
        productSizes.add(productSize);
        productSize.setProduct(this);
    }

    public void removeProductSize(ProductSize productSize) {
        productSizes.remove(productSize);
        productSize.setProduct(null);
    }

    public void clearAllProductSizes() {
        Set<ProductSize> productSizesToRemove = new HashSet<>(this.productSizes);

        for (ProductSize productSize : productSizesToRemove) {
            removeProductSize(productSize);
        }
    }
}
