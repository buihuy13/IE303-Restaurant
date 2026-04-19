package com.CNTTK18.blog_service.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.Common.Exception.ResourceNotFoundException;
import com.CNTTK18.blog_service.config.properties.BlogImageProperties;
import com.CNTTK18.blog_service.dto.UserRole;
import com.CNTTK18.blog_service.dto.request.CreateBlogCommentRequest;
import com.CNTTK18.blog_service.dto.request.CreateBlogRequest;
import com.CNTTK18.blog_service.dto.request.UpdateBlogRequest;
import com.CNTTK18.blog_service.dto.response.BlogCommentResponse;
import com.CNTTK18.blog_service.dto.response.BlogResponse;
import com.CNTTK18.blog_service.exception.ForbiddenException;
import com.CNTTK18.blog_service.mapper.BlogMapper;
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
import com.CNTTK18.blog_service.service.Impl.BlogServiceImpl;

@ExtendWith(MockitoExtension.class)
class BlogServiceImplTest {
    private static final UUID AUTHOR_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID BLOG_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");

    @Mock
    private BlogRepository blogRepository;

    @Mock
    private BlogCommentRepository blogCommentRepository;

    @Mock
    private BlogLikeRepository blogLikeRepository;

    @Mock
    private BlogViewEventRepository blogViewEventRepository;

    @Mock
    private BlogImageRepository blogImageRepository;

    @Mock
    private ImageHandleService imageHandleService;

    @Mock
    private BlogImageProperties blogImageProperties;

    @Mock
    private BlogMapper blogMapper;

    @Mock
    private BlogMetricsSseService blogMetricsSseService;

    @InjectMocks
    private BlogServiceImpl blogService;

    @BeforeEach
    void setUp() {
        lenient().when(blogImageProperties.getUnusedRetentionHours()).thenReturn(24L);
        lenient().when(blogImageProperties.getOrphanCleanupBatchSize()).thenReturn(50);
        lenient()
                .when(blogImageRepository.findByBlogPostIsNullAndCreatedAtBefore(
                        any(Instant.class), any(Pageable.class)))
                .thenReturn(Page.empty());
        lenient().when(blogRepository.save(any(BlogPost.class))).thenAnswer(invocation -> {
            BlogPost saved = invocation.getArgument(0);
            if (saved.getId() == null) {
                saved.setId(UUID.randomUUID());
            }
            if (saved.getCreatedAt() == null) {
                saved.setCreatedAt(Instant.now());
            }
            return saved;
        });
        lenient().when(blogMapper.toBlogResponse(any(BlogPost.class))).thenAnswer(invocation -> {
            BlogPost source = invocation.getArgument(0);
            return BlogResponse.builder()
                    .id(source.getId())
                    .authorId(source.getAuthorId())
                    .title(source.getTitle())
                    .slug(source.getSlug())
                    .content(source.getContent())
                    .coverImageUrl(source.getCoverImageUrl())
                    .excerpt(source.getExcerpt())
                    .category(source.getCategory())
                    .readTime(source.getReadTime())
                    .featured(source.getFeatured())
                    .viewsCount(source.getViewsCount())
                    .likesCount(source.getLikesCount())
                    .commentsCount(source.getCommentsCount())
                    .templateKey(source.getTemplateKey())
                    .templateVersion(source.getTemplateVersion())
                    .status(source.getStatus())
                    .build();
        });
    }

    @Test
    void createBlog_shouldCreateDraftByDefault() {
        String coverImageUrl = "https://res.cloudinary.com/demo/image/upload/v1/cover.png";
        CreateBlogRequest request = new CreateBlogRequest("  Blog title  ", "  Blog content  ", coverImageUrl, null);
        when(blogRepository.existsBySlug(anyString())).thenReturn(false);
        BlogImageAsset coverImageAsset = BlogImageAsset.builder()
                .imageUrl(coverImageUrl)
                .publicId("cover-public-id")
                .build();
        when(blogImageRepository.findAllByAuthorIdAndImageUrlIn(eq(AUTHOR_ID), anyCollection()))
                .thenReturn(List.of(coverImageAsset));
        when(blogImageRepository.findByBlogPostIdAndImageUrl(any(UUID.class), eq(coverImageUrl)))
                .thenReturn(Optional.of(coverImageAsset));

        BlogResponse response = blogService.createBlog(request, merchantUser(AUTHOR_ID));

        assertEquals(BlogStatus.DRAFT, response.getStatus());
        assertNotNull(response.getSlug());

        ArgumentCaptor<BlogPost> postCaptor = ArgumentCaptor.forClass(BlogPost.class);
        verify(blogRepository, atLeastOnce()).save(postCaptor.capture());
        BlogPost finalSavedPost =
                postCaptor.getAllValues().get(postCaptor.getAllValues().size() - 1);
        assertEquals("cover-public-id", finalSavedPost.getPublicID());
    }

    @Test
    void createBlog_shouldRejectArchivedStatus() {
        CreateBlogRequest request = new CreateBlogRequest("Blog title", "Blog content", null, BlogStatus.ARCHIVED);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class, () -> blogService.createBlog(request, merchantUser(AUTHOR_ID)));

        assertEquals("Cannot create blog with ARCHIVED status", exception.getMessage());
    }

    @Test
    void createBlog_shouldRejectNonAdminAndNonMerchant() {
        CreateBlogRequest request = new CreateBlogRequest("Blog title", "Blog content", null, BlogStatus.DRAFT);

        ForbiddenException exception =
                assertThrows(ForbiddenException.class, () -> blogService.createBlog(request, customerUser(AUTHOR_ID)));

        assertEquals("Only ADMIN or MERCHANT can create blogs", exception.getMessage());
    }

    @Test
    void uploadContentImages_shouldRejectEmptyFiles() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> blogService.uploadContentImages(List.of(), merchantUser(AUTHOR_ID)));

        assertEquals("At least one image is required", exception.getMessage());
    }

    @Test
    void uploadContentImages_shouldSaveAssetsAndReturnUrls() {
        MultipartFile file1 = org.mockito.Mockito.mock(MultipartFile.class);
        MultipartFile file2 = org.mockito.Mockito.mock(MultipartFile.class);
        List<MultipartFile> files = List.of(file1, file2);
        List<Map<String, String>> uploadedImages = List.of(
                Map.of("public_id", "public-1", "url", "https://cdn.test/image-1.png"),
                Map.of("public_id", "public-2", "url", "https://cdn.test/image-2.png"));

        when(imageHandleService.saveImageFiles(files)).thenReturn(uploadedImages);
        when(blogImageRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<String> imageUrls = blogService.uploadContentImages(files, merchantUser(AUTHOR_ID));

        assertEquals(List.of("https://cdn.test/image-1.png", "https://cdn.test/image-2.png"), imageUrls);
        verify(blogImageRepository).saveAll(any());
    }

    @Test
    void updateBlog_shouldPublishAndCleanupRemovedImages() {
        String oldUrl = "https://res.cloudinary.com/demo/image/upload/v1/old.png";
        String newUrl = "https://res.cloudinary.com/demo/image/upload/v1/new.png";

        BlogPost existingBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .title("Old title")
                .slug("old-slug")
                .content("Old content " + oldUrl)
                .coverImageUrl(oldUrl)
                .status(BlogStatus.DRAFT)
                .build();
        when(blogRepository.findById(BLOG_ID)).thenReturn(Optional.of(existingBlog));
        when(blogRepository.existsBySlug(anyString())).thenReturn(false);

        BlogImageAsset linkedNewImage = BlogImageAsset.builder()
                .imageUrl(newUrl)
                .publicId("new-public-id")
                .build();
        BlogImageAsset linkedOldImage = BlogImageAsset.builder()
                .imageUrl(oldUrl)
                .publicId("old-public-id")
                .blogPost(existingBlog)
                .build();
        when(blogImageRepository.findAllByAuthorIdAndImageUrlIn(eq(AUTHOR_ID), anyCollection()))
                .thenReturn(List.of(linkedNewImage));
        when(blogImageRepository.findAllByBlogPostId(BLOG_ID)).thenReturn(List.of(linkedOldImage));
        when(blogImageRepository.findByBlogPostIdAndImageUrl(BLOG_ID, newUrl)).thenReturn(Optional.of(linkedNewImage));

        UpdateBlogRequest request =
                new UpdateBlogRequest("Updated title", "Updated content " + newUrl, newUrl, BlogStatus.PUBLISHED);

        BlogResponse response = blogService.updateBlog(BLOG_ID, request, merchantUser(AUTHOR_ID));

        assertEquals(BlogStatus.PUBLISHED, response.getStatus());
        assertNotNull(existingBlog.getPublishedAt());
        verify(imageHandleService).deleteImage("old-public-id");
        verify(blogImageRepository).delete(linkedOldImage);
    }

    @Test
    void updateBlog_shouldRejectInvalidCoverImageUrl() {
        BlogPost existingBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .title("Same title")
                .slug("same-slug")
                .content("content")
                .status(BlogStatus.DRAFT)
                .build();
        when(blogRepository.findById(BLOG_ID)).thenReturn(Optional.of(existingBlog));

        UpdateBlogRequest request =
                new UpdateBlogRequest("Same title", "content", "ftp://invalid-host", BlogStatus.DRAFT);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> blogService.updateBlog(BLOG_ID, request, merchantUser(AUTHOR_ID)));

        assertEquals("Cover image URL must be a valid HTTP/HTTPS URL", exception.getMessage());
    }

    @Test
    void getBlogById_shouldRejectNonOwnerForNonPublishedBlog() {
        BlogPost draftBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .status(BlogStatus.DRAFT)
                .build();
        when(blogRepository.findById(BLOG_ID)).thenReturn(Optional.of(draftBlog));

        assertThrows(ForbiddenException.class, () -> blogService.getBlogById(BLOG_ID, merchantUser(UUID.randomUUID())));
    }

    @Test
    void getBlogById_shouldAllowAdminForNonPublishedBlog() {
        BlogPost draftBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .title("title")
                .slug("slug")
                .content("content")
                .status(BlogStatus.DRAFT)
                .build();
        when(blogRepository.findById(BLOG_ID)).thenReturn(Optional.of(draftBlog));

        BlogResponse response = blogService.getBlogById(BLOG_ID, adminUser(UUID.randomUUID()));

        assertEquals(BLOG_ID, response.getId());
    }

    @Test
    void getBlogBySlug_shouldHideNonPublishedBlog() {
        BlogPost draftBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .status(BlogStatus.DRAFT)
                .build();
        when(blogRepository.findBySlug("draft-slug")).thenReturn(Optional.of(draftBlog));

        assertThrows(ResourceNotFoundException.class, () -> blogService.getBlogBySlug("draft-slug", null));
    }

    @Test
    void getPublishedBlogs_shouldReturnAllPublishedBlogsWhenAuthorIdIsMissing() {
        Pageable pageable = PageRequest.of(0, 10);
        BlogPost publishedBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .title("Published title")
                .slug("published-title")
                .content("Published content")
                .status(BlogStatus.PUBLISHED)
                .build();
        when(blogRepository.findAllByStatus(BlogStatus.PUBLISHED, pageable))
                .thenReturn(new PageImpl<>(List.of(publishedBlog), pageable, 1));

        Page<BlogResponse> response = blogService.getPublishedBlogs(null, null, null, null, null, null, pageable);

        assertEquals(1, response.getTotalElements());
        assertEquals(BLOG_ID, response.getContent().get(0).getId());
        verify(blogRepository).findAllByStatus(BlogStatus.PUBLISHED, pageable);
    }

    @Test
    void getPublishedBlogs_shouldReturnPublishedBlogsByAuthorWhenAuthorIdIsProvided() {
        Pageable pageable = PageRequest.of(0, 10);
        BlogPost publishedBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .title("Published title")
                .slug("published-title")
                .content("Published content")
                .status(BlogStatus.PUBLISHED)
                .build();
        when(blogRepository.findAllByAuthorIdAndStatus(AUTHOR_ID, BlogStatus.PUBLISHED, pageable))
                .thenReturn(new PageImpl<>(List.of(publishedBlog), pageable, 1));

        Page<BlogResponse> response = blogService.getPublishedBlogs(AUTHOR_ID, null, null, null, null, null, pageable);

        assertEquals(1, response.getTotalElements());
        assertEquals(AUTHOR_ID, response.getContent().get(0).getAuthorId());
        verify(blogRepository).findAllByAuthorIdAndStatus(AUTHOR_ID, BlogStatus.PUBLISHED, pageable);
    }

    @Test
    void deleteBlog_shouldSoftDeleteAndClearPublishedAt() {
        BlogPost publishedBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .status(BlogStatus.PUBLISHED)
                .publishedAt(Instant.now())
                .build();
        when(blogRepository.findById(BLOG_ID)).thenReturn(Optional.of(publishedBlog));

        blogService.deleteBlog(BLOG_ID, merchantUser(AUTHOR_ID));

        assertEquals(BlogStatus.ARCHIVED, publishedBlog.getStatus());
        assertNull(publishedBlog.getPublishedAt());
        verify(blogRepository).save(publishedBlog);
    }

    @Test
    void getBlogById_shouldReturnActualPublishedCommentCount() {
        BlogPost publishedBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .title("Published title")
                .slug("published-title")
                .content("Published content")
                .status(BlogStatus.PUBLISHED)
                .commentsCount(7L)
                .build();
        when(blogRepository.findById(BLOG_ID)).thenReturn(Optional.of(publishedBlog));
        when(blogCommentRepository.countByBlogPostIdAndStatus(BLOG_ID, BlogCommentStatus.PUBLISHED))
                .thenReturn(4L);

        BlogResponse response = blogService.getBlogById(BLOG_ID, null);

        assertEquals(4L, response.getCommentsCount());
    }

    @Test
    void createComment_shouldRequireAuthenticatedUser() {
        CreateBlogCommentRequest request = new CreateBlogCommentRequest("Useful note", false);

        assertThrows(ForbiddenException.class, () -> blogService.createComment(BLOG_ID, request, null));
    }

    @Test
    void createComment_shouldUseAuthenticatedUserIdentity() {
        BlogPost publishedBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .status(BlogStatus.PUBLISHED)
                .commentsCount(0L)
                .build();
        UserRole authUser = UserRole.builder()
                .userId(AUTHOR_ID)
                .role("USER")
                .username("huutri")
                .email("huutri@example.com")
                .build();
        CreateBlogCommentRequest request = new CreateBlogCommentRequest("Useful note", true);

        when(blogRepository.findById(BLOG_ID)).thenReturn(Optional.of(publishedBlog));
        when(blogCommentRepository.save(any(BlogComment.class))).thenAnswer(invocation -> {
            BlogComment comment = invocation.getArgument(0);
            comment.setId(UUID.randomUUID());
            comment.setCreatedAt(Instant.now());
            return comment;
        });
        when(blogCommentRepository.countByBlogPostIdAndStatus(BLOG_ID, BlogCommentStatus.PUBLISHED))
                .thenReturn(1L);

        BlogCommentResponse response = blogService.createComment(BLOG_ID, request, authUser);

        assertEquals(AUTHOR_ID, response.getAuthorId());
        assertEquals("huutri", response.getName());
        assertEquals("Useful note", response.getMessage());
        assertEquals(BlogCommentStatus.PUBLISHED, response.getStatus());
        assertNull(response.getEmail());
        assertEquals(1L, publishedBlog.getCommentsCount());
        verify(blogRepository).save(publishedBlog);
    }

    @Test
    void incrementViews_shouldIncrementPublishedBlogViews() {
        BlogPost publishedBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .status(BlogStatus.PUBLISHED)
                .viewsCount(2L)
                .likesCount(5L)
                .commentsCount(4L)
                .build();
        when(blogRepository.findById(BLOG_ID)).thenReturn(Optional.of(publishedBlog));
        when(blogViewEventRepository.existsByBlogPost_IdAndVisitorKeyAndViewedAtAfter(
                        eq(BLOG_ID), eq("user:" + AUTHOR_ID), any(Instant.class)))
                .thenReturn(false);
        when(blogCommentRepository.countByBlogPostIdAndStatus(BLOG_ID, BlogCommentStatus.PUBLISHED))
                .thenReturn(4L);

        var response = blogService.incrementViews(BLOG_ID, customerUser(AUTHOR_ID), "127.0.0.1", "JUnit");

        assertEquals(3L, publishedBlog.getViewsCount());
        assertEquals(3L, response.getViewsCount());
        assertEquals(5L, response.getLikesCount());
        assertEquals(4L, response.getCommentsCount());
        assertEquals(false, response.getLikedByCurrentUser());
        assertEquals(true, response.getViewCounted());
        verify(blogViewEventRepository).save(any(BlogViewEvent.class));
        verify(blogRepository).save(publishedBlog);
        verify(blogMetricsSseService, never()).broadcastMetrics(any());
    }

    @Test
    void incrementViews_shouldNotIncrementDuplicateGuestWithinWindow() {
        BlogPost publishedBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .status(BlogStatus.PUBLISHED)
                .viewsCount(2L)
                .likesCount(5L)
                .commentsCount(4L)
                .build();
        when(blogRepository.findById(BLOG_ID)).thenReturn(Optional.of(publishedBlog));
        when(blogViewEventRepository.existsByBlogPost_IdAndVisitorKeyAndViewedAtAfter(
                        eq(BLOG_ID), anyString(), any(Instant.class)))
                .thenReturn(true);
        when(blogCommentRepository.countByBlogPostIdAndStatus(BLOG_ID, BlogCommentStatus.PUBLISHED))
                .thenReturn(4L);

        var response = blogService.incrementViews(BLOG_ID, null, "127.0.0.1", "JUnit");

        assertEquals(2L, publishedBlog.getViewsCount());
        assertEquals(2L, response.getViewsCount());
        assertEquals(false, response.getViewCounted());
        verify(blogViewEventRepository, never()).save(any(BlogViewEvent.class));
        verify(blogRepository, never()).save(publishedBlog);
        verify(blogMetricsSseService, never()).broadcastMetrics(any());
    }

    @Test
    void incrementViews_shouldHideNonPublishedBlog() {
        BlogPost draftBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .status(BlogStatus.DRAFT)
                .viewsCount(2L)
                .build();
        when(blogRepository.findById(BLOG_ID)).thenReturn(Optional.of(draftBlog));

        assertThrows(ResourceNotFoundException.class, () -> blogService.incrementViews(BLOG_ID, null, null, null));

        verify(blogRepository, never()).save(draftBlog);
    }

    @Test
    void likeBlog_shouldRequireAuthenticatedUser() {
        assertThrows(ForbiddenException.class, () -> blogService.likeBlog(BLOG_ID, null));
    }

    @Test
    void likeBlog_shouldIncrementOnlyOnceForSameUser() {
        BlogPost publishedBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .status(BlogStatus.PUBLISHED)
                .likesCount(2L)
                .build();
        when(blogRepository.findById(BLOG_ID)).thenReturn(Optional.of(publishedBlog));
        when(blogLikeRepository.existsByBlogPostIdAndUserId(BLOG_ID, AUTHOR_ID)).thenReturn(false);

        var response = blogService.likeBlog(BLOG_ID, customerUser(AUTHOR_ID));

        assertEquals(3L, response.getLikesCount());
        assertEquals(true, response.getLikedByCurrentUser());
        verify(blogLikeRepository).save(any(BlogLike.class));
        verify(blogRepository).save(publishedBlog);
    }

    @Test
    void likeBlog_shouldNotIncrementWhenAlreadyLiked() {
        BlogPost publishedBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .status(BlogStatus.PUBLISHED)
                .likesCount(2L)
                .build();
        when(blogRepository.findById(BLOG_ID)).thenReturn(Optional.of(publishedBlog));
        when(blogLikeRepository.existsByBlogPostIdAndUserId(BLOG_ID, AUTHOR_ID)).thenReturn(true);

        var response = blogService.likeBlog(BLOG_ID, customerUser(AUTHOR_ID));

        assertEquals(2L, response.getLikesCount());
        assertEquals(true, response.getLikedByCurrentUser());
        verify(blogLikeRepository, never()).save(any(BlogLike.class));
        verify(blogRepository, never()).save(publishedBlog);
    }

    @Test
    void unlikeBlog_shouldRemoveLikeAndDecrementCount() {
        BlogPost publishedBlog = BlogPost.builder()
                .id(BLOG_ID)
                .authorId(AUTHOR_ID)
                .status(BlogStatus.PUBLISHED)
                .likesCount(2L)
                .build();
        BlogLike existingLike = BlogLike.builder()
                .id(UUID.randomUUID())
                .blogPost(publishedBlog)
                .userId(AUTHOR_ID)
                .build();
        when(blogRepository.findById(BLOG_ID)).thenReturn(Optional.of(publishedBlog));
        when(blogLikeRepository.findByBlogPostIdAndUserId(BLOG_ID, AUTHOR_ID)).thenReturn(Optional.of(existingLike));

        var response = blogService.unlikeBlog(BLOG_ID, customerUser(AUTHOR_ID));

        assertEquals(1L, response.getLikesCount());
        assertEquals(false, response.getLikedByCurrentUser());
        verify(blogLikeRepository).delete(existingLike);
        verify(blogRepository).save(publishedBlog);
    }

    private UserRole merchantUser(UUID userId) {
        return UserRole.builder().userId(userId).role("MERCHANT").build();
    }

    private UserRole customerUser(UUID userId) {
        return UserRole.builder().userId(userId).role("CUSTOMER").build();
    }

    private UserRole adminUser(UUID userId) {
        return UserRole.builder().userId(userId).role("ADMIN").build();
    }
}
