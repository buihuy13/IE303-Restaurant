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
import com.CNTTK18.blog_service.service.Impl.BlogServiceImpl;

@ExtendWith(MockitoExtension.class)
class BlogServiceImplTest {
    private static final UUID AUTHOR_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID BLOG_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");

    @Mock
    private BlogRepository blogRepository;

    @Mock
    private BlogImageRepository blogImageRepository;

    @Mock
    private ImageHandleService imageHandleService;

    @Mock
    private BlogImageProperties blogImageProperties;

    @Mock
    private BlogMapper blogMapper;

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
            return new BlogResponse(
                    source.getId(),
                    source.getAuthorId(),
                    source.getTitle(),
                    source.getSlug(),
                    source.getContent(),
                    source.getCoverImageUrl(),
                    source.getStatus(),
                    null,
                    null,
                    null);
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

        assertThrows(ResourceNotFoundException.class, () -> blogService.getBlogBySlug("draft-slug"));
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

        Page<BlogResponse> response = blogService.getPublishedBlogs(null, pageable);

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

        Page<BlogResponse> response = blogService.getPublishedBlogs(AUTHOR_ID, pageable);

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
