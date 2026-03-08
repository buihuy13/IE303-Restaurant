package com.CNTTK18.blog_service.service.Impl;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.SlugGenerator;
import com.CNTTK18.blog_service.dto.UserRole;
import com.CNTTK18.blog_service.dto.request.CreateBlogRequest;
import com.CNTTK18.blog_service.dto.request.UpdateBlogRequest;
import com.CNTTK18.blog_service.dto.response.BlogResponse;
import com.CNTTK18.blog_service.exception.ForbiddenException;
import com.CNTTK18.blog_service.mapper.BlogMapper;
import com.CNTTK18.blog_service.model.BlogPost;
import com.CNTTK18.blog_service.model.data.BlogStatus;
import com.CNTTK18.blog_service.repository.BlogRepository;
import com.CNTTK18.blog_service.service.BlogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {
    private static final int MAX_SLUG_RETRY = 10;

    private final BlogRepository blogRepository;
    private final BlogMapper blogMapper;

    @Override
    @Transactional
    public BlogResponse createBlog(CreateBlogRequest request, UserRole authUser) {
        UUID authorId = extractAuthorId(authUser);
        BlogStatus status = request.getStatus() == null ? BlogStatus.DRAFT : request.getStatus();

        BlogPost newBlog = BlogPost.builder()
                .authorId(authorId)
                .title(request.getTitle().trim())
                .slug(generateUniqueSlug(request.getTitle()))
                .content(request.getContent().trim())
                .coverImageUrl(normalizeCoverImageUrl(request.getCoverImageUrl()))
                .status(status)
                .build();

        syncPublishedAt(newBlog);
        return blogMapper.toBlogResponse(blogRepository.save(newBlog));
    }

    @Override
    public BlogResponse getBlogById(UUID id) {
        return blogMapper.toBlogResponse(getBlogPostById(id));
    }

    @Override
    public BlogResponse getBlogBySlug(String slug) {
        return blogMapper.toBlogResponse(blogRepository
                .findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post not found")));
    }

    @Override
    public Page<BlogResponse> getBlogs(UUID authorId, BlogStatus status, Pageable pageable) {
        Page<BlogPost> blogs;
        if (authorId != null && status != null) {
            blogs = blogRepository.findAllByAuthorIdAndStatus(authorId, status, pageable);
        } else if (authorId != null) {
            blogs = blogRepository.findAllByAuthorId(authorId, pageable);
        } else if (status != null) {
            blogs = blogRepository.findAllByStatus(status, pageable);
        } else {
            blogs = blogRepository.findAll(pageable);
        }
        return blogs.map(blogMapper::toBlogResponse);
    }

    @Override
    @Transactional
    public BlogResponse updateBlog(UUID id, UpdateBlogRequest request, UserRole authUser) {
        BlogPost existingBlog = getBlogPostById(id);
        checkAuthority(existingBlog.getAuthorId(), authUser);

        if (request.getTitle() != null) {
            if (request.getTitle().isBlank()) {
                throw new IllegalArgumentException("Title must not be blank");
            }
            String normalizedTitle = request.getTitle().trim();
            if (!normalizedTitle.equals(existingBlog.getTitle())) {
                existingBlog.setTitle(normalizedTitle);
                existingBlog.setSlug(generateUniqueSlug(normalizedTitle));
            }
        }

        if (request.getContent() != null) {
            if (request.getContent().isBlank()) {
                throw new IllegalArgumentException("Content must not be blank");
            }
            existingBlog.setContent(request.getContent().trim());
        }

        if (request.getCoverImageUrl() != null) {
            existingBlog.setCoverImageUrl(normalizeCoverImageUrl(request.getCoverImageUrl()));
        }

        if (request.getStatus() != null) {
            existingBlog.setStatus(request.getStatus());
        }

        syncPublishedAt(existingBlog);
        return blogMapper.toBlogResponse(blogRepository.save(existingBlog));
    }

    @Override
    @Transactional
    public void deleteBlog(UUID id, UserRole authUser) {
        BlogPost blog = getBlogPostById(id);
        checkAuthority(blog.getAuthorId(), authUser);
        blogRepository.delete(blog);
    }

    private BlogPost getBlogPostById(UUID id) {
        return blogRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
    }

    private UUID extractAuthorId(UserRole authUser) {
        if (authUser == null || authUser.getUserId() == null) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }
        return authUser.getUserId();
    }

    private void checkAuthority(UUID ownerId, UserRole authUser) {
        if (authUser == null || authUser.getUserId() == null) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }

        String role = authUser.getRole() == null ? "" : authUser.getRole();
        if (!ownerId.equals(authUser.getUserId()) && !"ADMIN".equals(role)) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }
    }

    private String generateUniqueSlug(String title) {
        for (int i = 0; i < MAX_SLUG_RETRY; i++) {
            String slug = SlugGenerator.generate(title.trim());
            if (!blogRepository.existsBySlug(slug)) {
                return slug;
            }
        }
        throw new IllegalStateException("Unable to generate unique slug");
    }

    private String normalizeCoverImageUrl(String coverImageUrl) {
        if (coverImageUrl == null) return null;
        String normalized = coverImageUrl.trim();
        if (normalized.isEmpty()) return null;
        return normalized;
    }

    private void syncPublishedAt(BlogPost blogPost) {
        if (BlogStatus.PUBLISHED.equals(blogPost.getStatus())) {
            if (blogPost.getPublishedAt() == null) {
                blogPost.setPublishedAt(Instant.now());
            }
            return;
        }
        blogPost.setPublishedAt(null);
    }
}
