package com.CNTTK18.blog_service.service.Impl;

import java.time.Instant;
import java.util.Locale;
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
        checkCreatePermission(authUser);
        UUID authorId = extractAuthorId(authUser);
        BlogStatus status = request.getStatus() == null ? BlogStatus.DRAFT : request.getStatus();
        if (BlogStatus.ARCHIVED.equals(status)) {
            throw new IllegalArgumentException("Cannot create blog with ARCHIVED status");
        }

        BlogPost newBlog = BlogPost.builder()
                .authorId(authorId)
                .title(request.getTitle().trim())
                .slug(generateUniqueSlug(request.getTitle()))
                .content(request.getContent().trim())
                .coverImageUrl(normalizeCoverImageUrl(request.getCoverImageUrl()))
                .publicID(normalizeString(request.getPublicID()))
                .status(status)
                .build();

        syncPublishedAt(newBlog);
        return blogMapper.toBlogResponse(blogRepository.save(newBlog));
    }

    @Override
    public BlogResponse getBlogById(UUID id, UserRole authUser) {
        BlogPost blogPost = getBlogPostById(id);
        if (!BlogStatus.PUBLISHED.equals(blogPost.getStatus())) {
            checkAuthority(blogPost.getAuthorId(), authUser);
        }
        return blogMapper.toBlogResponse(blogPost);
    }

    @Override
    public BlogResponse getBlogBySlug(String slug) {
        BlogPost blogPost =
                blogRepository.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
        if (!BlogStatus.PUBLISHED.equals(blogPost.getStatus())) {
            throw new ResourceNotFoundException("Blog post not found");
        }
        return blogMapper.toBlogResponse(blogPost);
    }

    @Override
    public Page<BlogResponse> getPublishedBlogs(Pageable pageable) {
        return blogRepository.findAllByStatus(BlogStatus.PUBLISHED, pageable).map(blogMapper::toBlogResponse);
    }

    @Override
    public Page<BlogResponse> getDraftBlogs(UUID authorId, UserRole authUser, Pageable pageable) {
        UUID targetAuthorId = resolveTargetAuthorId(authorId, authUser);
        return blogRepository
                .findAllByAuthorIdAndStatus(targetAuthorId, BlogStatus.DRAFT, pageable)
                .map(blogMapper::toBlogResponse);
    }

    @Override
    public Page<BlogResponse> getArchivedBlogs(UUID authorId, UserRole authUser, Pageable pageable) {
        UUID targetAuthorId = resolveTargetAuthorId(authorId, authUser);
        return blogRepository
                .findAllByAuthorIdAndStatus(targetAuthorId, BlogStatus.ARCHIVED, pageable)
                .map(blogMapper::toBlogResponse);
    }

    @Override
    @Transactional
    public BlogResponse updateBlog(UUID id, UpdateBlogRequest request, UserRole authUser) {
        BlogPost existingBlog = getBlogPostById(id);
        checkAuthority(existingBlog.getAuthorId(), authUser);

        String normalizedTitle = request.getTitle().trim();
        if (normalizedTitle.isBlank()) {
            throw new IllegalArgumentException("Title must not be blank");
        }
        if (!normalizedTitle.equals(existingBlog.getTitle())) {
            existingBlog.setSlug(generateUniqueSlug(normalizedTitle));
        }
        existingBlog.setTitle(normalizedTitle);

        String normalizedContent = request.getContent().trim();
        if (normalizedContent.isBlank()) {
            throw new IllegalArgumentException("Content must not be blank");
        }
        existingBlog.setContent(normalizedContent);
        if (request.getStatus() == null) {
            throw new IllegalArgumentException("Status is required");
        }

        existingBlog.setCoverImageUrl(normalizeCoverImageUrl(request.getCoverImageUrl()));
        existingBlog.setPublicID(normalizeString(request.getPublicID()));
        existingBlog.setStatus(request.getStatus());

        syncPublishedAt(existingBlog);
        return blogMapper.toBlogResponse(blogRepository.save(existingBlog));
    }

    @Override
    @Transactional
    public void deleteBlog(UUID id, UserRole authUser) {
        BlogPost blog = getBlogPostById(id);
        checkAuthority(blog.getAuthorId(), authUser);
        blog.setStatus(BlogStatus.ARCHIVED);
        syncPublishedAt(blog);
        blogRepository.save(blog);
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

        if (!ownerId.equals(authUser.getUserId()) && !isAdmin(authUser)) {
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

    private String normalizeString(String value) {
        if (value == null) return null;
        String normalized = value.trim();
        if (normalized.isEmpty()) return null;
        return normalized;
    }

    private UUID resolveTargetAuthorId(UUID authorId, UserRole authUser) {
        UUID actorId = extractAuthorId(authUser);
        if (authorId == null) {
            return actorId;
        }
        checkAuthority(authorId, authUser);
        return authorId;
    }

    private boolean isAdmin(UserRole authUser) {
        return "ADMIN".equals(normalizeRole(authUser.getRole()));
    }

    private void checkCreatePermission(UserRole authUser) {
        if (authUser == null || authUser.getUserId() == null) {
            throw new ForbiddenException("You are not authorized to perform this action");
        }

        String normalizedRole = normalizeRole(authUser.getRole());
        if (!"ADMIN".equals(normalizedRole) && !"MERCHANT".equals(normalizedRole)) {
            throw new ForbiddenException("Only ADMIN or MERCHANT can create blogs");
        }
    }

    private String normalizeRole(String role) {
        if (role == null) return "";
        String normalized = role.toUpperCase(Locale.ROOT);
        if (normalized.startsWith("ROLE_")) {
            return normalized.substring(5);
        }
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
