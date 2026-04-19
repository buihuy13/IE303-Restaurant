package com.CNTTK18.blog_service.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

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
import com.CNTTK18.blog_service.model.data.BlogCommentStatus;

public interface BlogService {
    List<String> uploadContentImages(List<MultipartFile> files, UserRole authUser);

    BlogResponse createBlog(CreateBlogRequest request, UserRole authUser);

    BlogResponse getBlogById(UUID id, UserRole authUser);

    BlogResponse getBlogBySlug(String slug, UserRole authUser);

    Page<BlogResponse> getPublishedBlogs(
            UUID authorId,
            String search,
            String category,
            String tag,
            Boolean featured,
            UserRole authUser,
            Pageable pageable);

    Page<BlogResponse> getDraftBlogs(UUID authorId, UserRole authUser, Pageable pageable);

    Page<BlogResponse> getArchivedBlogs(UUID authorId, UserRole authUser, Pageable pageable);

    BlogResponse updateBlog(UUID id, UpdateBlogRequest request, UserRole authUser);

    void deleteBlog(UUID id, UserRole authUser);

    Page<BlogResponse> getRelatedBlogs(UUID id, int size, UserRole authUser);

    List<String> getCategories();

    List<String> getTags();

    Page<BlogCommentResponse> getComments(UUID blogId, Pageable pageable);

    BlogCommentResponse createComment(UUID blogId, CreateBlogCommentRequest request, UserRole authUser);

    Page<BlogCommentResponse> getModerationComments(
            UUID blogId, BlogCommentStatus status, UserRole authUser, Pageable pageable);

    BlogCommentResponse updateCommentStatus(UUID commentId, BlogCommentStatus status, UserRole authUser);

    BlogMetricsResponse incrementViews(UUID blogId, UserRole authUser, String ipAddress, String userAgent);

    SseEmitter streamMetrics(UUID blogId);

    BlogMetricsResponse likeBlog(UUID blogId, UserRole authUser);

    BlogMetricsResponse unlikeBlog(UUID blogId, UserRole authUser);

    List<EditorialTemplateResponse> getEditorialTemplates();

    EditorialTemplateResponse getEditorialTemplate(String key);

    EditorialTemplateRenderResponse renderEditorialTemplate(String key, EditorialTemplateRenderRequest request);
}
