package com.CNTTK18.blog_service.repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CNTTK18.blog_service.model.BlogImageAsset;

@Repository
public interface BlogImageRepository extends JpaRepository<BlogImageAsset, UUID> {
    List<BlogImageAsset> findAllByBlogPostId(UUID blogPostId);

    Optional<BlogImageAsset> findByBlogPostIdAndImageUrl(UUID blogPostId, String imageUrl);

    List<BlogImageAsset> findAllByAuthorIdAndImageUrlIn(UUID authorId, Collection<String> imageUrls);

    Page<BlogImageAsset> findByBlogPostIsNullAndCreatedAtBefore(Instant cutoff, Pageable pageable);
}
