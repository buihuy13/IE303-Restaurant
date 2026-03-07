package com.CNTTK18.blog_service.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.CNTTK18.blog_service.model.BlogPost;
import com.CNTTK18.blog_service.model.data.BlogStatus;

@Repository
public interface BlogRepository extends JpaRepository<BlogPost, UUID>, JpaSpecificationExecutor<BlogPost> {
    Optional<BlogPost> findBySlug(String slug);

    boolean existsBySlug(String slug);

    Page<BlogPost> findAllByStatus(BlogStatus status, Pageable pageable);

    Page<BlogPost> findAllByAuthorId(UUID authorId, Pageable pageable);

    Page<BlogPost> findAllByAuthorIdAndStatus(UUID authorId, BlogStatus status, Pageable pageable);
}
