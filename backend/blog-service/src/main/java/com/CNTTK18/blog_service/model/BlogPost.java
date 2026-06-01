package com.CNTTK18.blog_service.model;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.CNTTK18.blog_service.model.data.BlogStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "blog_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class BlogPost {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, unique = true, length = 300)
    private String slug;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "cover_image_url", columnDefinition = "TEXT")
    private String coverImageUrl;

    @Column(name = "public_id")
    private String publicID;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @Column(length = 120)
    private String category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "blog_post_tags", joinColumns = @JoinColumn(name = "blog_post_id"))
    @Column(name = "tag", length = 80)
    @Builder.Default
    private Set<String> tags = new LinkedHashSet<>();

    @Column(name = "read_time", nullable = false)
    @Builder.Default
    private Integer readTime = 1;

    @Column(nullable = false)
    @Builder.Default
    private Boolean featured = false;

    @Column(name = "views_count", nullable = false)
    @Builder.Default
    private Long viewsCount = 0L;

    @Column(name = "likes_count", nullable = false)
    @Builder.Default
    private Long likesCount = 0L;

    @Column(name = "comments_count", nullable = false)
    @Builder.Default
    private Long commentsCount = 0L;

    @Column(name = "template_key", length = 80)
    private String templateKey;

    @Column(name = "template_version", length = 40)
    private String templateVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BlogStatus status;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "created_at", updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = BlogStatus.DRAFT;
        }
        if (readTime == null || readTime < 1) {
            readTime = 1;
        }
        if (featured == null) {
            featured = false;
        }
        if (viewsCount == null) {
            viewsCount = 0L;
        }
        if (likesCount == null) {
            likesCount = 0L;
        }
        if (commentsCount == null) {
            commentsCount = 0L;
        }
    }
}
