package com.CNTTK18.blog_service.service.Impl;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.SlugGenerator;
import com.CNTTK18.blog_service.config.properties.BlogImageProperties;
import com.CNTTK18.blog_service.dto.UserRole;
import com.CNTTK18.blog_service.dto.request.CreateBlogRequest;
import com.CNTTK18.blog_service.dto.request.UpdateBlogRequest;
import com.CNTTK18.blog_service.dto.response.BlogResponse;
import com.CNTTK18.blog_service.exception.ForbiddenException;
import com.CNTTK18.blog_service.mapper.BlogMapper;
import com.CNTTK18.blog_service.model.BlogImageAsset;
import com.CNTTK18.blog_service.model.BlogPost;
import com.CNTTK18.blog_service.model.data.BlogStatus;
import com.CNTTK18.blog_service.repository.BlogImageRepository;
import com.CNTTK18.blog_service.repository.BlogRepository;
import com.CNTTK18.blog_service.service.BlogService;
import com.CNTTK18.blog_service.service.ImageHandleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogServiceImpl implements BlogService {
    private static final int MAX_SLUG_RETRY = 10;
    private static final String KEY_PUBLIC_ID = "public_id";
    private static final String KEY_URL = "url";
    private static final Pattern URL_PATTERN = Pattern.compile("https?://[^\\s\"'<>]+");

    private final BlogRepository blogRepository;
    private final BlogImageRepository blogImageRepository;
    private final ImageHandleService imageHandleService;
    private final BlogImageProperties blogImageProperties;
    private final BlogMapper blogMapper;

    @Override
    @Transactional
    public List<String> uploadContentImages(List<MultipartFile> files, UserRole authUser) {
        checkCreatePermission(authUser);
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("At least one image is required");
        }

        UUID actorId = extractAuthorId(authUser);
        List<Map<String, String>> uploadedImages = imageHandleService.saveImageFiles(files);
        List<BlogImageAsset> imageAssets = new ArrayList<>(uploadedImages.size());
        for (Map<String, String> uploadedImage : uploadedImages) {
            String imageUrl = normalizeString(uploadedImage.get(KEY_URL));
            String publicId = normalizeString(uploadedImage.get(KEY_PUBLIC_ID));
            if (imageUrl == null || publicId == null) {
                throw new IllegalStateException("Image upload provider returned incomplete data");
            }
            imageAssets.add(BlogImageAsset.builder()
                    .authorId(actorId)
                    .imageUrl(imageUrl)
                    .publicId(publicId)
                    .build());
        }

        blogImageRepository.saveAll(imageAssets);
        List<String> imageUrls = new ArrayList<>(imageAssets.size());
        for (BlogImageAsset imageAsset : imageAssets) {
            imageUrls.add(imageAsset.getImageUrl());
        }
        cleanupStaleOrphanImagesBestEffort();
        return imageUrls;
    }

    @Override
    @Transactional
    public BlogResponse createBlog(CreateBlogRequest request, UserRole authUser) {
        checkCreatePermission(authUser);
        UUID actorId = extractAuthorId(authUser);
        BlogStatus status = request.getStatus() == null ? BlogStatus.DRAFT : request.getStatus();
        if (BlogStatus.ARCHIVED.equals(status)) {
            throw new IllegalArgumentException("Cannot create blog with ARCHIVED status");
        }
        String normalizedTitle = normalizeRequiredText(request.getTitle(), "Title must not be blank");

        BlogPost newBlog = BlogPost.builder()
                .authorId(actorId)
                .title(normalizedTitle)
                .slug(generateUniqueSlug(normalizedTitle))
                .content(normalizeRequiredText(request.getContent(), "Content must not be blank"))
                .coverImageUrl(normalizeCoverImageUrl(request.getCoverImageUrl()))
                .status(status)
                .build();

        syncPublishedAt(newBlog);
        BlogPost savedBlog = blogRepository.save(newBlog);
        syncImageAssets(savedBlog, actorId, Set.of());
        cleanupStaleOrphanImagesBestEffort();
        return blogMapper.toBlogResponse(blogRepository.save(savedBlog));
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
        UUID actorId = extractAuthorId(authUser);
        Set<String> previousImageUrls = collectImageUrls(existingBlog.getContent(), existingBlog.getCoverImageUrl());

        String normalizedTitle = normalizeRequiredText(request.getTitle(), "Title must not be blank");
        if (!normalizedTitle.equals(existingBlog.getTitle())) {
            existingBlog.setSlug(generateUniqueSlug(normalizedTitle));
        }
        existingBlog.setTitle(normalizedTitle);
        existingBlog.setContent(normalizeRequiredText(request.getContent(), "Content must not be blank"));
        if (request.getStatus() == null) {
            throw new IllegalArgumentException("Status is required");
        }

        existingBlog.setCoverImageUrl(normalizeCoverImageUrl(request.getCoverImageUrl()));
        existingBlog.setStatus(request.getStatus());

        syncPublishedAt(existingBlog);
        syncImageAssets(existingBlog, actorId, previousImageUrls);
        cleanupStaleOrphanImagesBestEffort();
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

    private void syncImageAssets(BlogPost blogPost, UUID actorId, Set<String> previousImageUrls) {
        Set<String> currentImageUrls = collectImageUrls(blogPost.getContent(), blogPost.getCoverImageUrl());
        linkUploadedImagesToBlog(blogPost, actorId, currentImageUrls);
        cleanupRemovedBlogImages(blogPost.getId(), previousImageUrls, currentImageUrls);
        blogPost.setPublicID(resolveCoverPublicId(blogPost.getId(), blogPost.getCoverImageUrl()));
    }

    private void linkUploadedImagesToBlog(BlogPost blogPost, UUID actorId, Set<String> currentImageUrls) {
        if (currentImageUrls.isEmpty()) {
            return;
        }

        List<BlogImageAsset> uploadedImages =
                blogImageRepository.findAllByAuthorIdAndImageUrlIn(actorId, currentImageUrls);
        if (uploadedImages.isEmpty()) {
            return;
        }

        for (BlogImageAsset uploadedImage : uploadedImages) {
            UUID linkedBlogId = uploadedImage.getBlogPost() == null
                    ? null
                    : uploadedImage.getBlogPost().getId();
            if (linkedBlogId == null || linkedBlogId.equals(blogPost.getId())) {
                uploadedImage.setBlogPost(blogPost);
            }
        }
        blogImageRepository.saveAll(uploadedImages);
    }

    private void cleanupRemovedBlogImages(
            UUID blogPostId, Set<String> previousImageUrls, Set<String> currentImageUrls) {
        if (blogPostId == null || previousImageUrls.isEmpty()) {
            return;
        }

        Set<String> removedUrls = new HashSet<>(previousImageUrls);
        removedUrls.removeAll(currentImageUrls);
        if (removedUrls.isEmpty()) {
            return;
        }

        List<BlogImageAsset> linkedImages = blogImageRepository.findAllByBlogPostId(blogPostId);
        for (BlogImageAsset linkedImage : linkedImages) {
            if (removedUrls.contains(linkedImage.getImageUrl())) {
                imageHandleService.deleteImage(linkedImage.getPublicId());
                blogImageRepository.delete(linkedImage);
            }
        }
    }

    private String resolveCoverPublicId(UUID blogPostId, String coverImageUrl) {
        String normalizedCoverImageUrl = normalizeCoverImageUrl(coverImageUrl);
        if (blogPostId == null || normalizedCoverImageUrl == null) {
            return null;
        }
        return blogImageRepository
                .findByBlogPostIdAndImageUrl(blogPostId, normalizedCoverImageUrl)
                .map(BlogImageAsset::getPublicId)
                .orElse(null);
    }

    private Set<String> collectImageUrls(String content, String coverImageUrl) {
        Set<String> imageUrls = new HashSet<>();
        String normalizedCoverImageUrl = normalizeCoverImageUrl(coverImageUrl);
        if (normalizedCoverImageUrl != null) {
            imageUrls.add(normalizedCoverImageUrl);
        }
        if (content == null || content.isBlank()) {
            return imageUrls;
        }

        Matcher matcher = URL_PATTERN.matcher(content);
        while (matcher.find()) {
            String normalizedUrl = trimTrailingPunctuation(matcher.group());
            if (!normalizedUrl.isBlank()) {
                imageUrls.add(normalizedUrl);
            }
        }
        return imageUrls;
    }

    private String trimTrailingPunctuation(String rawUrl) {
        if (rawUrl == null) {
            return "";
        }
        String normalized = rawUrl.trim();
        while (!normalized.isEmpty()) {
            char lastChar = normalized.charAt(normalized.length() - 1);
            if (lastChar == ')' || lastChar == ']' || lastChar == '}' || lastChar == ',' || lastChar == '.') {
                normalized = normalized.substring(0, normalized.length() - 1);
                continue;
            }
            break;
        }
        return normalized;
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

    private String normalizeRequiredText(String value, String errorMessage) {
        if (value == null || value.trim().isBlank()) {
            throw new IllegalArgumentException(errorMessage);
        }
        return value.trim();
    }

    private String normalizeCoverImageUrl(String coverImageUrl) {
        String normalizedCoverImageUrl = normalizeString(coverImageUrl);
        if (normalizedCoverImageUrl == null) {
            return null;
        }

        try {
            URI uri = URI.create(normalizedCoverImageUrl);
            String scheme = uri.getScheme();
            if (scheme == null) {
                throw new IllegalArgumentException("Cover image URL must be a valid HTTP/HTTPS URL");
            }
            String normalizedScheme = scheme.toLowerCase(Locale.ROOT);
            if (!"http".equals(normalizedScheme) && !"https".equals(normalizedScheme)) {
                throw new IllegalArgumentException("Cover image URL must be a valid HTTP/HTTPS URL");
            }
            if (uri.getHost() == null || uri.getHost().isBlank()) {
                throw new IllegalArgumentException("Cover image URL must be a valid HTTP/HTTPS URL");
            }
            return normalizedCoverImageUrl;
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Cover image URL must be a valid HTTP/HTTPS URL");
        }
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

    private void cleanupStaleOrphanImagesBestEffort() {
        try {
            Instant cutoff = Instant.now().minus(Duration.ofHours(blogImageProperties.getUnusedRetentionHours()));
            Pageable pageable = PageRequest.of(
                    0, blogImageProperties.getOrphanCleanupBatchSize(), Sort.by(Sort.Direction.ASC, "createdAt"));
            List<BlogImageAsset> orphanImages = blogImageRepository
                    .findByBlogPostIsNullAndCreatedAtBefore(cutoff, pageable)
                    .getContent();
            if (orphanImages.isEmpty()) {
                return;
            }

            for (BlogImageAsset orphanImage : orphanImages) {
                imageHandleService.deleteImage(orphanImage.getPublicId());
            }
            blogImageRepository.deleteAll(orphanImages);
        } catch (Exception ex) {
            // Cleanup is best-effort and should not block create/update/upload requests.
            log.warn("Failed to cleanup stale orphan blog images: {}", ex.getMessage());
        }
    }
}
