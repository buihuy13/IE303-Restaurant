package com.CNTTK18.blog_service.service.Impl;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.Common.Util.SlugGenerator;
import com.CNTTK18.blog_service.config.properties.BlogImageProperties;
import com.CNTTK18.blog_service.dto.UserRole;
import com.CNTTK18.blog_service.dto.request.CreateBlogCommentRequest;
import com.CNTTK18.blog_service.dto.request.CreateBlogRequest;
import com.CNTTK18.blog_service.dto.request.EditorialTemplateRenderRequest;
import com.CNTTK18.blog_service.dto.request.UpdateBlogRequest;
import com.CNTTK18.blog_service.dto.response.BlogCommentResponse;
import com.CNTTK18.blog_service.dto.response.BlogMetricsResponse;
import com.CNTTK18.blog_service.dto.response.BlogResponse;
import com.CNTTK18.blog_service.dto.response.EditorialTemplateRenderResponse;
import com.CNTTK18.blog_service.dto.response.EditorialTemplateResponse;
import com.CNTTK18.blog_service.exception.ForbiddenException;
import com.CNTTK18.blog_service.mapper.BlogMapper;
import com.CNTTK18.blog_service.messaging.BlogMetricsPublisher;
import com.CNTTK18.blog_service.model.BlogComment;
import com.CNTTK18.blog_service.model.BlogImageAsset;
import com.CNTTK18.blog_service.model.BlogLike;
import com.CNTTK18.blog_service.model.BlogPost;
import com.CNTTK18.blog_service.model.BlogViewEvent;
import com.CNTTK18.blog_service.model.data.BlogCommentStatus;
import com.CNTTK18.blog_service.model.data.BlogStatus;
import com.CNTTK18.blog_service.repository.BlogCommentRepository;
import com.CNTTK18.blog_service.repository.BlogImageRepository;
import com.CNTTK18.blog_service.repository.BlogLikeRepository;
import com.CNTTK18.blog_service.repository.BlogRepository;
import com.CNTTK18.blog_service.repository.BlogViewEventRepository;
import com.CNTTK18.blog_service.service.BlogService;
import com.CNTTK18.blog_service.service.ImageHandleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogServiceImpl implements BlogService {
    private static final int MAX_SLUG_RETRY = 10;
    private static final Duration VIEW_DEDUPE_WINDOW = Duration.ofHours(24);
    private static final String KEY_PUBLIC_ID = "public_id";
    private static final String KEY_URL = "url";
    private static final Pattern URL_PATTERN = Pattern.compile("https?://[^\\s\"'<>]+");

    private final BlogRepository blogRepository;
    private final BlogCommentRepository blogCommentRepository;
    private final BlogLikeRepository blogLikeRepository;
    private final BlogViewEventRepository blogViewEventRepository;
    private final BlogImageRepository blogImageRepository;
    private final ImageHandleService imageHandleService;
    private final BlogImageProperties blogImageProperties;
    private final BlogMapper blogMapper;
    private final BlogMetricsPublisher blogMetricsPublisher;

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
                .excerpt(resolveExcerpt(request.getExcerpt(), request.getContent()))
                .category(normalizeString(request.getCategory()))
                .tags(normalizeTags(request.getTags()))
                .readTime(resolveReadTime(request.getReadTime(), request.getContent()))
                .featured(Boolean.TRUE.equals(request.getFeatured()))
                .templateKey(normalizeString(request.getTemplateKey()))
                .templateVersion(normalizeString(request.getTemplateVersion()))
                .status(status)
                .build();

        syncPublishedAt(newBlog);
        BlogPost savedBlog = blogRepository.save(newBlog);
        syncImageAssets(savedBlog, actorId, Set.of());
        cleanupStaleOrphanImagesBestEffort();
        return toResponse(blogRepository.save(savedBlog), authUser);
    }

    @Override
    public BlogResponse getBlogById(UUID id, UserRole authUser) {
        BlogPost blogPost = getBlogPostById(id);
        if (!BlogStatus.PUBLISHED.equals(blogPost.getStatus())) {
            checkAuthority(blogPost.getAuthorId(), authUser);
        }
        return toResponse(blogPost, authUser);
    }

    @Override
    public BlogResponse getBlogBySlug(String slug, UserRole authUser) {
        BlogPost blogPost =
                blogRepository.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException("Blog post not found"));
        if (!BlogStatus.PUBLISHED.equals(blogPost.getStatus())) {
            throw new ResourceNotFoundException("Blog post not found");
        }
        return toResponse(blogPost, authUser);
    }

    @Override
    public Page<BlogResponse> getPublishedBlogs(
            UUID authorId,
            String search,
            String category,
            String tag,
            Boolean featured,
            UserRole authUser,
            Pageable pageable) {
        if (isBlankFilter(search) && isBlankFilter(category) && isBlankFilter(tag) && featured == null) {
            if (authorId == null) {
                return blogRepository
                        .findAllByStatus(BlogStatus.PUBLISHED, pageable)
                        .map(blogPost -> toResponse(blogPost, authUser));
            }
            return blogRepository
                    .findAllByAuthorIdAndStatus(authorId, BlogStatus.PUBLISHED, pageable)
                    .map(blogPost -> toResponse(blogPost, authUser));
        }
        Specification<BlogPost> specification = publishedBlogSpecification(authorId, search, category, tag, featured);
        return blogRepository.findAll(specification, pageable).map(blogPost -> toResponse(blogPost, authUser));
    }

    @Override
    public Page<BlogResponse> getDraftBlogs(UUID authorId, UserRole authUser, Pageable pageable) {
        UUID targetAuthorId = resolveTargetAuthorId(authorId, authUser);
        return blogRepository
                .findAllByAuthorIdAndStatus(targetAuthorId, BlogStatus.DRAFT, pageable)
                .map(blogPost -> toResponse(blogPost, authUser));
    }

    @Override
    public Page<BlogResponse> getArchivedBlogs(UUID authorId, UserRole authUser, Pageable pageable) {
        UUID targetAuthorId = resolveTargetAuthorId(authorId, authUser);
        return blogRepository
                .findAllByAuthorIdAndStatus(targetAuthorId, BlogStatus.ARCHIVED, pageable)
                .map(blogPost -> toResponse(blogPost, authUser));
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
        existingBlog.setExcerpt(resolveExcerpt(request.getExcerpt(), request.getContent()));
        existingBlog.setCategory(normalizeString(request.getCategory()));
        existingBlog.setTags(normalizeTags(request.getTags()));
        existingBlog.setReadTime(resolveReadTime(request.getReadTime(), request.getContent()));
        existingBlog.setFeatured(Boolean.TRUE.equals(request.getFeatured()));
        existingBlog.setTemplateKey(normalizeString(request.getTemplateKey()));
        existingBlog.setTemplateVersion(normalizeString(request.getTemplateVersion()));
        existingBlog.setStatus(request.getStatus());

        syncPublishedAt(existingBlog);
        syncImageAssets(existingBlog, actorId, previousImageUrls);
        cleanupStaleOrphanImagesBestEffort();
        return toResponse(blogRepository.save(existingBlog), authUser);
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

    @Override
    public Page<BlogResponse> getRelatedBlogs(UUID id, int size, UserRole authUser) {
        BlogPost currentBlog = getBlogPostById(id);
        if (!BlogStatus.PUBLISHED.equals(currentBlog.getStatus())) {
            throw new ResourceNotFoundException("Blog post not found");
        }

        Pageable pageable =
                PageRequest.of(0, Math.max(1, Math.min(size, 12)), Sort.by(Sort.Direction.DESC, "publishedAt"));
        Specification<BlogPost> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("status"), BlogStatus.PUBLISHED));
            predicates.add(criteriaBuilder.notEqual(root.get("id"), currentBlog.getId()));

            List<Predicate> relatedPredicates = new ArrayList<>();
            String category = normalizeString(currentBlog.getCategory());
            if (category != null) {
                relatedPredicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("category")), category.toLowerCase(Locale.ROOT)));
            }
            if (currentBlog.getTags() != null && !currentBlog.getTags().isEmpty()) {
                Join<BlogPost, String> tagJoin = root.join("tags", JoinType.LEFT);
                relatedPredicates.add(criteriaBuilder
                        .lower(tagJoin)
                        .in(currentBlog.getTags().stream()
                                .map(tag -> tag.toLowerCase(Locale.ROOT))
                                .toList()));
                query.distinct(true);
            }
            if (!relatedPredicates.isEmpty()) {
                predicates.add(criteriaBuilder.or(relatedPredicates.toArray(Predicate[]::new)));
            }
            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };

        return blogRepository.findAll(specification, pageable).map(blogPost -> toResponse(blogPost, authUser));
    }

    @Override
    public List<String> getCategories() {
        return blogRepository.findDistinctCategoriesByStatus(BlogStatus.PUBLISHED);
    }

    @Override
    public List<String> getTags() {
        return blogRepository.findDistinctTagsByStatus(BlogStatus.PUBLISHED);
    }

    @Override
    public Page<BlogCommentResponse> getComments(UUID blogId, Pageable pageable) {
        ensurePublishedBlog(blogId);
        return blogCommentRepository
                .findAllByBlogPostIdAndStatus(blogId, BlogCommentStatus.PUBLISHED, pageable)
                .map(this::toCommentResponse);
    }

    @Override
    @Transactional
    public BlogCommentResponse createComment(UUID blogId, CreateBlogCommentRequest request, UserRole authUser) {
        UUID actorId = extractAuthorId(authUser);
        BlogPost blogPost = ensurePublishedBlog(blogId);
        BlogComment comment = BlogComment.builder()
                .blogPost(blogPost)
                .authorId(actorId)
                .guestName(resolveCommentDisplayName(authUser))
                .guestEmail(resolveCommentEmail(authUser))
                .content(normalizeRequiredText(request.getMessage(), "Message must not be blank"))
                .notify(Boolean.TRUE.equals(request.getNotify()))
                .status(BlogCommentStatus.PUBLISHED)
                .build();
        BlogComment savedComment = blogCommentRepository.save(comment);
        blogPost.setCommentsCount(resolvePublishedCommentCount(blogPost));
        blogRepository.save(blogPost);
        broadcastMetrics(blogPost);
        return toCommentResponse(savedComment);
    }

    @Override
    public Page<BlogCommentResponse> getModerationComments(
            UUID blogId, BlogCommentStatus status, UserRole authUser, Pageable pageable) {
        extractAuthorId(authUser);
        Specification<BlogComment> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (blogId != null) {
                predicates.add(criteriaBuilder.equal(root.get("blogPost").get("id"), blogId));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (!isAdmin(authUser)) {
                predicates.add(criteriaBuilder.equal(root.get("blogPost").get("authorId"), authUser.getUserId()));
            }
            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
        return blogCommentRepository.findAll(specification, pageable).map(this::toCommentResponse);
    }

    @Override
    @Transactional
    public BlogCommentResponse updateCommentStatus(UUID commentId, BlogCommentStatus status, UserRole authUser) {
        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }
        BlogComment comment = blogCommentRepository
                .findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog comment not found"));
        BlogPost blogPost = comment.getBlogPost();
        checkAuthority(blogPost.getAuthorId(), authUser);

        if (!status.equals(comment.getStatus())) {
            comment.setStatus(status);
            BlogComment savedComment = blogCommentRepository.save(comment);
            blogPost.setCommentsCount(resolvePublishedCommentCount(blogPost));
            blogRepository.save(blogPost);
            broadcastMetrics(blogPost);
            return toCommentResponse(savedComment);
        }
        return toCommentResponse(comment);
    }

    @Override
    @Transactional
    public BlogMetricsResponse incrementViews(UUID blogId, UserRole authUser, String ipAddress, String userAgent) {
        BlogPost blogPost = ensurePublishedBlog(blogId);
        String visitorKey = resolveViewVisitorKey(authUser, ipAddress, userAgent);
        Instant cutoff = Instant.now().minus(VIEW_DEDUPE_WINDOW);
        boolean alreadyViewed =
                blogViewEventRepository.existsByBlogPost_IdAndVisitorKeyAndViewedAtAfter(blogId, visitorKey, cutoff);
        if (alreadyViewed) {
            return toMetricsResponse(blogPost, false, false);
        }

        blogViewEventRepository.save(BlogViewEvent.builder()
                .blogPost(blogPost)
                .userId(authUser == null ? null : authUser.getUserId())
                .visitorKey(visitorKey)
                .ipHash(hashNullable(ipAddress))
                .userAgentHash(hashNullable(userAgent))
                .viewedAt(Instant.now())
                .build());
        blogPost.setViewsCount(nullToZero(blogPost.getViewsCount()) + 1);
        BlogPost savedBlog = blogRepository.save(blogPost);
        return toMetricsResponse(savedBlog, false, true);
    }

    @Override
    @Transactional
    public BlogMetricsResponse likeBlog(UUID blogId, UserRole authUser) {
        UUID userId = extractAuthorId(authUser);
        BlogPost blogPost = ensurePublishedBlog(blogId);
        boolean changed = false;
        if (!blogLikeRepository.existsByBlogPostIdAndUserId(blogId, userId)) {
            blogLikeRepository.save(
                    BlogLike.builder().blogPost(blogPost).userId(userId).build());
            blogPost.setLikesCount(nullToZero(blogPost.getLikesCount()) + 1);
            blogRepository.save(blogPost);
            changed = true;
        }
        BlogMetricsResponse response = toMetricsResponse(blogPost, true, false);
        if (changed) {
            broadcastMetrics(blogPost);
        }
        return response;
    }

    @Override
    @Transactional
    public BlogMetricsResponse unlikeBlog(UUID blogId, UserRole authUser) {
        UUID userId = extractAuthorId(authUser);
        BlogPost blogPost = ensurePublishedBlog(blogId);
        final boolean[] changed = {false};
        blogLikeRepository.findByBlogPostIdAndUserId(blogId, userId).ifPresent(blogLike -> {
            blogLikeRepository.delete(blogLike);
            blogPost.setLikesCount(Math.max(0, nullToZero(blogPost.getLikesCount()) - 1));
            blogRepository.save(blogPost);
            changed[0] = true;
        });
        BlogMetricsResponse response = toMetricsResponse(blogPost, false, false);
        if (changed[0]) {
            broadcastMetrics(blogPost);
        }
        return response;
    }

    @Override
    public List<EditorialTemplateResponse> getEditorialTemplates() {
        return editorialTemplates();
    }

    @Override
    public EditorialTemplateResponse getEditorialTemplate(String key) {
        return editorialTemplates().stream()
                .filter(template -> template.getKey().equals(key))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Editorial template not found"));
    }

    @Override
    public EditorialTemplateRenderResponse renderEditorialTemplate(String key, EditorialTemplateRenderRequest request) {
        EditorialTemplateResponse template = getEditorialTemplate(key);
        String title = normalizeRequiredText(request.getTitle(), "Title must not be blank");
        String topic = normalizeRequiredText(request.getTopic(), "Topic must not be blank");
        String language = normalizeString(request.getLanguage());
        String category = normalizeString(request.getCategory());

        String content =
                switch (key) {
                    case "restaurant_guide" -> renderRestaurantGuide(title, topic, category);
                    case "menu_strategy" -> renderMenuStrategy(title, topic, category);
                    default -> renderFoodEditorial(title, topic, category, language);
                };

        return EditorialTemplateRenderResponse.builder()
                .content(content)
                .templateKey(template.getKey())
                .templateVersion(String.valueOf(template.getVersion()))
                .build();
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

    private Specification<BlogPost> publishedBlogSpecification(
            UUID authorId, String search, String category, String tag, Boolean featured) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("status"), BlogStatus.PUBLISHED));
            if (authorId != null) {
                predicates.add(criteriaBuilder.equal(root.get("authorId"), authorId));
            }
            String normalizedSearch = normalizeString(search);
            if (normalizedSearch != null) {
                String pattern = "%" + normalizedSearch.toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern));
            }
            String normalizedCategory = normalizeString(category);
            if (normalizedCategory != null) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("category")), normalizedCategory.toLowerCase(Locale.ROOT)));
            }
            String normalizedTag = normalizeString(tag);
            if (normalizedTag != null) {
                Join<BlogPost, String> tagJoin = root.join("tags", JoinType.INNER);
                predicates.add(
                        criteriaBuilder.equal(criteriaBuilder.lower(tagJoin), normalizedTag.toLowerCase(Locale.ROOT)));
                query.distinct(true);
            }
            if (featured != null) {
                predicates.add(criteriaBuilder.equal(root.get("featured"), featured));
            }
            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private BlogPost ensurePublishedBlog(UUID blogId) {
        BlogPost blogPost = getBlogPostById(blogId);
        if (!BlogStatus.PUBLISHED.equals(blogPost.getStatus())) {
            throw new ResourceNotFoundException("Blog post not found");
        }
        return blogPost;
    }

    private BlogResponse toResponse(BlogPost blogPost, UserRole authUser) {
        BlogResponse response = blogMapper.toBlogResponse(blogPost);
        response.setTags(blogPost.getTags() == null ? List.of() : new ArrayList<>(blogPost.getTags()));
        response.setViewsCount(nullToZero(blogPost.getViewsCount()));
        response.setLikesCount(nullToZero(blogPost.getLikesCount()));
        response.setCommentsCount(resolvePublishedCommentCount(blogPost));
        boolean likedByCurrentUser = authUser != null
                && authUser.getUserId() != null
                && blogLikeRepository.existsByBlogPostIdAndUserId(blogPost.getId(), authUser.getUserId());
        response.setLikedByCurrentUser(likedByCurrentUser);
        if (normalizeString(response.getAuthorName()) == null) {
            response.setAuthorName("FoodEats Editor");
        }
        response.setAuthorAvatarUrl(null);
        if (normalizeString(response.getAuthorRole()) == null) {
            response.setAuthorRole("FoodEats Editor");
        }
        return response;
    }

    private BlogCommentResponse toCommentResponse(BlogComment comment) {
        return BlogCommentResponse.builder()
                .id(comment.getId())
                .blogId(comment.getBlogPost().getId())
                .authorId(comment.getAuthorId())
                .name(comment.getGuestName())
                .email(null)
                .message(comment.getContent())
                .notify(comment.getNotify())
                .status(comment.getStatus())
                .createdAt(blogMapper.convertToVNZone(comment.getCreatedAt()))
                .build();
    }

    private BlogMetricsResponse toMetricsResponse(BlogPost blogPost, boolean likedByCurrentUser, boolean viewCounted) {
        return BlogMetricsResponse.builder()
                .blogId(blogPost.getId())
                .viewsCount(nullToZero(blogPost.getViewsCount()))
                .likesCount(nullToZero(blogPost.getLikesCount()))
                .commentsCount(resolvePublishedCommentCount(blogPost))
                .likedByCurrentUser(likedByCurrentUser)
                .viewCounted(viewCounted)
                .build();
    }

    private void broadcastMetrics(BlogPost blogPost) {
        blogMetricsPublisher.publish(toMetricsResponse(blogPost, false, false));
    }

    private long resolvePublishedCommentCount(BlogPost blogPost) {
        if (blogPost.getId() == null) {
            return nullToZero(blogPost.getCommentsCount());
        }
        return blogCommentRepository.countByBlogPostIdAndStatus(blogPost.getId(), BlogCommentStatus.PUBLISHED);
    }

    private long nullToZero(Long value) {
        return value == null ? 0 : value;
    }

    private String resolveViewVisitorKey(UserRole authUser, String ipAddress, String userAgent) {
        if (authUser != null && authUser.getUserId() != null) {
            return "user:" + authUser.getUserId();
        }
        return "fallback:"
                + hash((normalizeString(ipAddress) == null ? "unknown-ip" : normalizeString(ipAddress))
                        + "|"
                        + (normalizeString(userAgent) == null ? "unknown-agent" : normalizeString(userAgent)));
    }

    private String hashNullable(String value) {
        String normalized = normalizeString(value);
        return normalized == null ? null : hash(normalized);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    private String resolveExcerpt(String requestedExcerpt, String content) {
        String normalizedExcerpt = normalizeString(requestedExcerpt);
        if (normalizedExcerpt != null) {
            return truncate(normalizedExcerpt, 240);
        }
        String plainText = normalizeString(stripMarkdown(content));
        if (plainText == null) {
            return null;
        }
        return truncate(plainText, 180);
    }

    private Integer resolveReadTime(Integer requestedReadTime, String content) {
        if (requestedReadTime != null && requestedReadTime > 0) {
            return requestedReadTime;
        }
        String plainText = stripMarkdown(content);
        if (plainText.isBlank()) {
            return 1;
        }
        int words = plainText.trim().split("\\s+").length;
        return Math.max(1, (int) Math.ceil(words / 220.0));
    }

    private Set<String> normalizeTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return new LinkedHashSet<>();
        }
        Set<String> normalizedTags = new LinkedHashSet<>();
        for (String tag : tags) {
            String normalizedTag = normalizeString(tag);
            if (normalizedTag != null) {
                normalizedTags.add(truncate(normalizedTag, 80));
            }
            if (normalizedTags.size() >= 8) {
                break;
            }
        }
        return normalizedTags;
    }

    private String stripMarkdown(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("!\\[[^]]*]\\([^)]*\\)", " ")
                .replaceAll("\\[[^]]*]\\([^)]*\\)", " ")
                .replaceAll("[#>*_`~\\-]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, Math.max(0, maxLength - 3)).trim() + "...";
    }

    private List<EditorialTemplateResponse> editorialTemplates() {
        return List.of(
                EditorialTemplateResponse.builder()
                        .key("food_editorial")
                        .name("Food Editorial")
                        .description("A magazine-style article with context, practical tips, and a clear takeaway.")
                        .language("en")
                        .version(1)
                        .sections(
                                List.of("Opening", "Why it matters", "Practical guide", "Takeaways", "Closing thought"))
                        .defaultContent(renderFoodEditorial("Your food story title", "your topic", null, "en"))
                        .qualityRules(List.of(
                                "Use at least four headings",
                                "Include one actionable list",
                                "End with a practical takeaway"))
                        .build(),
                EditorialTemplateResponse.builder()
                        .key("restaurant_guide")
                        .name("Restaurant Guide")
                        .description("A structured guide for diners, menu builders, and local restaurant discovery.")
                        .language("en")
                        .version(1)
                        .sections(List.of(
                                "Overview", "What to look for", "How to choose", "Common mistakes", "Final note"))
                        .defaultContent(
                                renderRestaurantGuide("Your restaurant guide title", "your restaurant topic", null))
                        .qualityRules(List.of(
                                "Explain who the guide is for",
                                "Include decision criteria",
                                "Avoid vague recommendations"))
                        .build(),
                EditorialTemplateResponse.builder()
                        .key("menu_strategy")
                        .name("Menu Strategy")
                        .description(
                                "A strategy template for merchants writing about menus, service flow, and operations.")
                        .language("en")
                        .version(1)
                        .sections(List.of("Problem", "Menu decision", "Service impact", "Checklist", "Next move"))
                        .defaultContent(renderMenuStrategy("Your menu strategy title", "your menu topic", null))
                        .qualityRules(List.of(
                                "Tie advice to operations", "Keep tips measurable", "Include a short checklist"))
                        .build());
    }

    private String renderFoodEditorial(String title, String topic, String category, String language) {
        String label = category == null ? "Food Notes" : category;
        return """
                # %s

                A good food story starts with a useful question: how can %s make everyday meals feel calmer, smarter, and more memorable?

                ## Why This Matters

                Readers do not need another loud trend. They need a clear point of view, practical context, and a reason to try something today. In %s, focus on the small choices that change the whole table.

                ## What To Notice First

                - The ingredients, tools, or habits that make the biggest difference.
                - The common mistake people make when they rush the process.
                - The one detail that makes the result feel personal.

                ## Practical Steps

                Start with one repeatable action. Explain it simply, then show how it scales for a busy weekday, a shared meal, or a restaurant service moment.

                ## Takeaway

                A strong %s article should leave readers with a move they can use immediately and a reason to come back for the next story.
                """
                .formatted(title, topic, topic, label);
    }

    private String renderRestaurantGuide(String title, String topic, String category) {
        String label = category == null ? "Restaurant Guide" : category;
        return """
                # %s

                Choosing well is easier when the signals are clear. This guide looks at %s through the lens of comfort, service, flavor, and repeat value.

                ## Who This Guide Helps

                Use this guide if you are comparing options, planning a group meal, or helping guests understand what makes a place worth returning to.

                ## Signals To Watch

                - A focused menu with dishes the kitchen can execute consistently.
                - Clear ordering flow and realistic timing.
                - Details that make guests feel guided instead of rushed.

                ## Questions To Ask

                What does the restaurant do best? Which dish explains the kitchen's point of view? Where does the experience become easier for the guest?

                ## Final Note

                The best %s recommendations are specific. Give readers enough detail to decide with confidence.
                """
                .formatted(title, topic, label);
    }

    private String renderMenuStrategy(String title, String topic, String category) {
        String label = category == null ? "Menu Strategy" : category;
        return """
                # %s

                A menu works best when every item has a job. This draft explores %s as a practical decision, not just a creative one.

                ## The Core Problem

                Menu builders often add more choices to solve uncertainty. A stronger approach is to make the right choice easier to see.

                ## Service Impact

                - Shorter decision time for guests.
                - Cleaner prep and fewer operational surprises.
                - Better storytelling around signature dishes.

                ## Checklist

                1. Keep the strongest items visible.
                2. Remove choices that slow service without improving satisfaction.
                3. Use descriptions that explain flavor, portion, and occasion.

                ## Next Move

                Treat %s as a weekly review habit. Small adjustments make the menu easier to sell, cook, and enjoy.
                """
                .formatted(title, topic, label);
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

        URI uri = URI.create(normalizedCoverImageUrl);

        String scheme = uri.getScheme();
        String normalizedScheme = scheme == null ? "" : scheme.toLowerCase(Locale.ROOT);
        if (!"http".equals(normalizedScheme) && !"https".equals(normalizedScheme)) {
            throw new IllegalArgumentException("Cover image URL must be a valid HTTP/HTTPS URL");
        }
        if (uri.getHost() == null || uri.getHost().isBlank()) {
            throw new IllegalArgumentException("Cover image URL must be a valid HTTP/HTTPS URL");
        }

        return normalizedCoverImageUrl;
    }

    private String resolveCommentDisplayName(UserRole authUser) {
        String username = normalizeString(authUser.getUsername());
        if (username != null) {
            return truncate(username, 120);
        }
        String email = normalizeString(authUser.getEmail());
        if (email != null) {
            return truncate(email.split("@")[0], 120);
        }
        return "Member " + authUser.getUserId().toString().substring(0, 8);
    }

    private String resolveCommentEmail(UserRole authUser) {
        String email = normalizeString(authUser.getEmail());
        if (email != null) {
            return truncate(email.toLowerCase(Locale.ROOT), 255);
        }
        return authUser.getUserId() + "@authenticated.local";
    }

    private String normalizeString(String value) {
        if (value == null) return null;
        String normalized = value.trim();
        if (normalized.isEmpty()) return null;
        return normalized;
    }

    private boolean isBlankFilter(String value) {
        return value == null || value.trim().isBlank();
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
