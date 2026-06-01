package com.CNTTK18.blog_service.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.CNTTK18.blog_service.model.BlogLike;

public interface BlogLikeRepository extends JpaRepository<BlogLike, UUID> {
    boolean existsByBlogPostIdAndUserId(UUID blogPostId, UUID userId);

    Optional<BlogLike> findByBlogPostIdAndUserId(UUID blogPostId, UUID userId);

    long countByBlogPostId(UUID blogPostId);
}
