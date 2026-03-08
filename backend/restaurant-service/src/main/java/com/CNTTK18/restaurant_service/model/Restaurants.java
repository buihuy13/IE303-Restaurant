package com.CNTTK18.restaurant_service.model;

import java.time.Instant;
import java.time.LocalTime;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import org.locationtech.jts.geom.Point;
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
    private double longitude; // kinh độ
    private double latitude; // vĩ độ
    private float rating;

    @Column(name = "opening_time", nullable = false)
    private LocalTime openingTime;

    @Column(name = "closing_time", nullable = false)
    private LocalTime closingTime;

    private String phone;

    @Column(name = "image_url")
    private String imageURL;

    @Column(name = "public_id")
    private String publicID; // Cho việc xóa ảnh trong cloud

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    private boolean enabled;

    @Column(name = "total_review")
    private int totalReview;

    private String slug;

    @Column(name = "created_at")
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private Instant updatedAt;

    // Sử dụng kdl của postgis spatial type
    @Column(columnDefinition = "geometry(Point,4326)")
    private Point geom;

    @ManyToMany
    @JoinTable(
            name = "restaurant_categories",
            joinColumns = @jakarta.persistence.JoinColumn(name = "restaurant_id"),
            inverseJoinColumns = @jakarta.persistence.JoinColumn(name = "category_id"))
    private Set<Categories> categories;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Products> products;

    public void addCate(Categories cate) {
        if (this.categories == null) {
            this.categories = new java.util.HashSet<>();
        }
        this.categories.add(cate);
    }

    public void removeCate(Categories cate) {
        this.categories.remove(cate);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Restaurants that = (Restaurants) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        // Các đối tượng bằng nhau phải có hashCode bằng nhau
        return id != null ? id.hashCode() : 0;
    }
}
