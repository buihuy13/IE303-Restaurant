package com.CNTTK18.blog_service.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.CNTTK18.blog_service.model.BlogComment;
import com.CNTTK18.blog_service.model.data.BlogCommentStatus;

public interface BlogCommentRepository extends JpaRepository<BlogComment, UUID>, JpaSpecificationExecutor<BlogComment> {
    Page<BlogComment> findAllByBlogPostIdAndStatus(UUID blogPostId, BlogCommentStatus status, Pageable pageable);

    long countByBlogPostIdAndStatus(UUID blogPostId, BlogCommentStatus status);
}
