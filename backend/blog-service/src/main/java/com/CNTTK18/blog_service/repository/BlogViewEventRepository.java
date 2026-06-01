package com.CNTTK18.blog_service.repository;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.CNTTK18.blog_service.model.BlogViewEvent;

public interface BlogViewEventRepository extends JpaRepository<BlogViewEvent, UUID> {
    boolean existsByBlogPost_IdAndVisitorKeyAndViewedAtAfter(UUID blogPostId, String visitorKey, Instant viewedAfter);
}
