package com.CNTTK18.blog_service.controller;

import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.CNTTK18.blog_service.dto.UserRole;
import com.CNTTK18.blog_service.dto.request.CreateBlogCommentRequest;
import com.CNTTK18.blog_service.dto.request.CreateBlogRequest;
import com.CNTTK18.blog_service.dto.request.EditorialTemplateRenderRequest;
import com.CNTTK18.blog_service.dto.request.UpdateBlogRequest;
import com.CNTTK18.blog_service.dto.request.UpdateBlogCommentStatusRequest;
import com.CNTTK18.blog_service.dto.response.BlogCommentResponse;
import com.CNTTK18.blog_service.dto.response.BlogMetricsResponse;
import com.CNTTK18.blog_service.dto.response.BlogResponse;
import com.CNTTK18.blog_service.dto.response.EditorialTemplateRenderResponse;
import com.CNTTK18.blog_service.dto.response.EditorialTemplateResponse;
import com.CNTTK18.blog_service.dto.response.ImageUploadResponse;
import com.CNTTK18.blog_service.dto.response.MessageResponse;
import com.CNTTK18.blog_service.model.data.BlogCommentStatus;
import com.CNTTK18.blog_service.service.BlogService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
@Tag(
        name = "Blog API",
        description =
                "Public list returns only PUBLISHED posts. Soft delete maps to ARCHIVED. "
                        + "Slug endpoint is /api/blogs/slug/{slug}. Internal Cloudinary public_id is not exposed in API responses.")
public class BlogController {
    private static final String CREATE_BLOG_REQUEST_EXAMPLE =
            """
            {
              "title": "How To Choose A Good Restaurant",
              "content": "This is a blog content with an image https://res.cloudinary.com/demo/image/upload/v1/blog-cover.png",
              "coverImageUrl": "https://res.cloudinary.com/demo/image/upload/v1/blog-cover.png",
              "status": "DRAFT"
            }
            """;

    private static final String UPDATE_BLOG_REQUEST_EXAMPLE =
            """
            {
              "title": "How To Choose A Good Restaurant - Updated",
              "content": "Updated content with image https://res.cloudinary.com/demo/image/upload/v1/blog-cover-2.png",
              "coverImageUrl": "https://res.cloudinary.com/demo/image/upload/v1/blog-cover-2.png",
              "status": "PUBLISHED"
            }
            """;

    private static final String BLOG_RESPONSE_EXAMPLE =
            """
            {
              "id": "fd893a29-cf6d-47b1-942e-2046d71ff8f3",
              "authorId": "11111111-1111-1111-1111-111111111111",
              "title": "How To Choose A Good Restaurant",
              "slug": "how-to-choose-a-good-restaurant-a1b2c",
              "content": "This is a blog content",
              "coverImageUrl": "https://res.cloudinary.com/demo/image/upload/v1/blog-cover.png",
              "status": "PUBLISHED",
              "publishedAt": "2026-03-22T09:30:00+07:00",
              "createdAt": "2026-03-22T09:20:00+07:00",
              "updatedAt": "2026-03-22T09:30:00+07:00"
            }
            """;

    private static final String PAGED_BLOG_RESPONSE_EXAMPLE =
            """
            {
              "content": [
                {
                  "id": "fd893a29-cf6d-47b1-942e-2046d71ff8f3",
                  "authorId": "11111111-1111-1111-1111-111111111111",
                  "title": "How To Choose A Good Restaurant",
                  "slug": "how-to-choose-a-good-restaurant-a1b2c",
                  "content": "This is a blog content",
                  "coverImageUrl": "https://res.cloudinary.com/demo/image/upload/v1/blog-cover.png",
                  "status": "PUBLISHED"
                }
              ],
              "totalElements": 1,
              "totalPages": 1,
              "size": 20,
              "number": 0
            }
            """;

    private static final String IMAGE_UPLOAD_RESPONSE_EXAMPLE =
            """
            {
              "imageUrls": [
                "https://res.cloudinary.com/demo/image/upload/v1/blog-content-1.png",
                "https://res.cloudinary.com/demo/image/upload/v1/blog-content-2.png"
              ]
            }
            """;

    private static final String SUCCESS_MESSAGE_RESPONSE_EXAMPLE =
            """
            {
              "message": "Blog archived successfully"
            }
            """;

    private static final String ERROR_400_EXAMPLE =
            """
            {
              "errorCode": "ILLEGAL_ARGUMENT",
              "message": "Cover image URL must be a valid HTTP/HTTPS URL"
            }
            """;

    private static final String ERROR_403_EXAMPLE =
            """
            {
              "errorCode": "NOT_ALLOWED_ACTION",
              "message": "Only ADMIN or MERCHANT can create blogs"
            }
            """;

    private static final String ERROR_404_EXAMPLE =
            """
            {
              "errorCode": "RESOURCE_NOT_FOUND",
              "message": "Blog post not found"
            }
            """;

    private static final String ERROR_413_EXAMPLE =
            """
            {
              "errorCode": "PAYLOAD_TOO_LARGE",
              "message": "Uploaded file exceeds max allowed size"
            }
            """;

    private final BlogService blogService;

    @Operation(
            summary = "Upload images for blog content",
            description = "Upload one or multiple image files for blog content. "
                    + "Response returns public image URLs only (internal public_id is never exposed).")
    @ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "Images uploaded successfully",
                content =
                        @Content(
                                mediaType = "application/json",
                                schema = @Schema(implementation = ImageUploadResponse.class),
                                examples = @ExampleObject(value = IMAGE_UPLOAD_RESPONSE_EXAMPLE))),
        @ApiResponse(
                responseCode = "400",
                description = "Invalid multipart request or unsupported file type",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_400_EXAMPLE))),
        @ApiResponse(
                responseCode = "403",
                description = "Only ADMIN or MERCHANT can upload images",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_403_EXAMPLE))),
        @ApiResponse(
                responseCode = "413",
                description = "Upload payload too large",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_413_EXAMPLE)))
    })
    @PostMapping(value = "/images/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageUploadResponse> uploadContentImages(
            @RequestPart("images") List<MultipartFile> images, @AuthenticationPrincipal UserRole authUser) {
        List<String> imageUrls = blogService.uploadContentImages(images, authUser);
        return new ResponseEntity<>(new ImageUploadResponse(imageUrls), HttpStatusCode.valueOf(201));
    }

    @Operation(summary = "Create a new blog post")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Full blog payload for creation",
            content =
                    @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = CreateBlogRequest.class),
                            examples = @ExampleObject(value = CREATE_BLOG_REQUEST_EXAMPLE)))
    @ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "Blog created successfully",
                content =
                        @Content(
                                mediaType = "application/json",
                                schema = @Schema(implementation = BlogResponse.class),
                                examples = @ExampleObject(value = BLOG_RESPONSE_EXAMPLE))),
        @ApiResponse(
                responseCode = "400",
                description = "Invalid payload",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_400_EXAMPLE))),
        @ApiResponse(
                responseCode = "403",
                description = "Only ADMIN or MERCHANT can create blogs",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_403_EXAMPLE)))
    })
    @PostMapping("")
    public ResponseEntity<BlogResponse> createBlog(
            @RequestBody @Valid CreateBlogRequest request, @AuthenticationPrincipal UserRole authUser) {
        return new ResponseEntity<>(blogService.createBlog(request, authUser), HttpStatusCode.valueOf(201));
    }

    @Operation(
            summary = "Get all published blogs",
            description = "Public endpoint. Returns only posts with status PUBLISHED. "
                    + "When authorId is provided, returns published posts by that author.")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Paged published blogs",
                content =
                        @Content(
                                mediaType = "application/json",
                                examples = @ExampleObject(value = PAGED_BLOG_RESPONSE_EXAMPLE)))
    })
    @GetMapping("")
    public ResponseEntity<Page<BlogResponse>> getPublishedBlogs(
            @RequestParam(required = false) UUID authorId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Boolean featured,
            Pageable pageable,
            @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.getPublishedBlogs(authorId, search, category, tag, featured, authUser, pageable));
    }

    @GetMapping("/editorial-templates")
    public ResponseEntity<List<EditorialTemplateResponse>> getEditorialTemplates() {
        return ResponseEntity.ok(blogService.getEditorialTemplates());
    }

    @GetMapping("/editorial-templates/{key}")
    public ResponseEntity<EditorialTemplateResponse> getEditorialTemplate(@PathVariable String key) {
        return ResponseEntity.ok(blogService.getEditorialTemplate(key));
    }

    @PostMapping("/editorial-templates/{key}/render")
    public ResponseEntity<EditorialTemplateRenderResponse> renderEditorialTemplate(
            @PathVariable String key, @RequestBody @Valid EditorialTemplateRenderRequest request) {
        return ResponseEntity.ok(blogService.renderEditorialTemplate(key, request));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(blogService.getCategories());
    }

    @GetMapping("/tags")
    public ResponseEntity<List<String>> getTags() {
        return ResponseEntity.ok(blogService.getTags());
    }

    @GetMapping("/related/{id}")
    public ResponseEntity<Page<BlogResponse>> getRelatedBlogs(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "3") int size,
            @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.getRelatedBlogs(id, size, authUser));
    }

    @GetMapping("/comments")
    public ResponseEntity<Page<BlogCommentResponse>> getModerationComments(
            @RequestParam(required = false) UUID blogId,
            @RequestParam(required = false) BlogCommentStatus status,
            Pageable pageable,
            @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.getModerationComments(blogId, status, authUser, pageable));
    }

    @PatchMapping("/comments/{commentId}/status")
    public ResponseEntity<BlogCommentResponse> updateCommentStatus(
            @PathVariable UUID commentId,
            @RequestBody @Valid UpdateBlogCommentStatusRequest request,
            @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.updateCommentStatus(commentId, request.getStatus(), authUser));
    }

    @Operation(summary = "Get draft blogs by author (default current user)")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Paged draft blogs",
                content =
                        @Content(
                                mediaType = "application/json",
                                examples = @ExampleObject(value = PAGED_BLOG_RESPONSE_EXAMPLE))),
        @ApiResponse(
                responseCode = "403",
                description = "Not allowed to read drafts of another author",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_403_EXAMPLE)))
    })
    @GetMapping("/drafts")
    public ResponseEntity<Page<BlogResponse>> getDraftBlogs(
            @RequestParam(required = false) UUID authorId,
            Pageable pageable,
            @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.getDraftBlogs(authorId, authUser, pageable));
    }

    @Operation(summary = "Get archived blogs by author (default current user)")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Paged archived blogs",
                content =
                        @Content(
                                mediaType = "application/json",
                                examples = @ExampleObject(value = PAGED_BLOG_RESPONSE_EXAMPLE))),
        @ApiResponse(
                responseCode = "403",
                description = "Not allowed to read archived blogs of another author",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_403_EXAMPLE)))
    })
    @GetMapping("/archived")
    public ResponseEntity<Page<BlogResponse>> getArchivedBlogs(
            @RequestParam(required = false) UUID authorId,
            Pageable pageable,
            @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.getArchivedBlogs(authorId, authUser, pageable));
    }

    @Operation(summary = "Get published blog by slug")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Published blog found",
                content =
                        @Content(
                                mediaType = "application/json",
                                schema = @Schema(implementation = BlogResponse.class),
                                examples = @ExampleObject(value = BLOG_RESPONSE_EXAMPLE))),
        @ApiResponse(
                responseCode = "404",
                description = "Blog not found or not published",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_404_EXAMPLE)))
    })
    @GetMapping("/slug/{slug}")
    public ResponseEntity<BlogResponse> getBlogBySlug(
            @PathVariable String slug, @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.getBlogBySlug(slug, authUser));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<Page<BlogCommentResponse>> getComments(@PathVariable UUID id, Pageable pageable) {
        return ResponseEntity.ok(blogService.getComments(id, pageable));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<BlogCommentResponse> createComment(
            @PathVariable UUID id,
            @RequestBody @Valid CreateBlogCommentRequest request,
            @AuthenticationPrincipal UserRole authUser) {
        return new ResponseEntity<>(blogService.createComment(id, request, authUser), HttpStatusCode.valueOf(201));
    }

    @PostMapping("/{id}/views")
    public ResponseEntity<BlogMetricsResponse> incrementViews(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserRole authUser,
            HttpServletRequest request) {
        return ResponseEntity.ok(
                blogService.incrementViews(id, authUser, resolveClientIp(request), request.getHeader("User-Agent")));
    }

    @GetMapping(value = "/{id}/metrics/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamMetrics(@PathVariable UUID id) {
        return blogService.streamMetrics(id);
    }

    @PostMapping("/{id}/likes")
    public ResponseEntity<BlogMetricsResponse> likeBlog(
            @PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.likeBlog(id, authUser));
    }

    @DeleteMapping("/{id}/likes")
    public ResponseEntity<BlogMetricsResponse> unlikeBlog(
            @PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.unlikeBlog(id, authUser));
    }

    @Operation(summary = "Get blog by ID")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Blog found",
                content =
                        @Content(
                                mediaType = "application/json",
                                schema = @Schema(implementation = BlogResponse.class),
                                examples = @ExampleObject(value = BLOG_RESPONSE_EXAMPLE))),
        @ApiResponse(
                responseCode = "403",
                description = "Not allowed to access unpublished blog of another author",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_403_EXAMPLE))),
        @ApiResponse(
                responseCode = "404",
                description = "Blog not found",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_404_EXAMPLE)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getBlogById(@PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.getBlogById(id, authUser));
    }

    @Operation(summary = "Update blog by ID (full update)")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Full blog payload for update",
            content =
                    @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UpdateBlogRequest.class),
                            examples = @ExampleObject(value = UPDATE_BLOG_REQUEST_EXAMPLE)))
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Blog updated successfully",
                content =
                        @Content(
                                mediaType = "application/json",
                                schema = @Schema(implementation = BlogResponse.class),
                                examples = @ExampleObject(value = BLOG_RESPONSE_EXAMPLE))),
        @ApiResponse(
                responseCode = "400",
                description = "Invalid payload",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_400_EXAMPLE))),
        @ApiResponse(
                responseCode = "403",
                description = "Not allowed to update this blog",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_403_EXAMPLE))),
        @ApiResponse(
                responseCode = "404",
                description = "Blog not found",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_404_EXAMPLE)))
    })
    @PutMapping("/{id}")
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable UUID id,
            @RequestBody @Valid UpdateBlogRequest request,
            @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.updateBlog(id, request, authUser));
    }

    @Operation(
            summary = "Soft delete blog by ID",
            description = "Soft delete only. Blog status is changed to ARCHIVED instead of physical deletion.")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Blog archived successfully",
                content =
                        @Content(
                                mediaType = "application/json",
                                schema = @Schema(implementation = MessageResponse.class),
                                examples = @ExampleObject(value = SUCCESS_MESSAGE_RESPONSE_EXAMPLE))),
        @ApiResponse(
                responseCode = "403",
                description = "Not allowed to delete this blog",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_403_EXAMPLE))),
        @ApiResponse(
                responseCode = "404",
                description = "Blog not found",
                content =
                        @Content(mediaType = "application/json", examples = @ExampleObject(value = ERROR_404_EXAMPLE)))
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteBlog(
            @PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        blogService.deleteBlog(id, authUser);
        return ResponseEntity.ok(new MessageResponse("Blog archived successfully"));
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
