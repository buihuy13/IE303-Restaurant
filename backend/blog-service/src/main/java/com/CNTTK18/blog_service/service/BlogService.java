package com.CNTTK18.blog_service.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.blog_service.dto.UserRole;
import com.CNTTK18.blog_service.dto.request.CreateBlogRequest;
import com.CNTTK18.blog_service.dto.request.UpdateBlogRequest;
import com.CNTTK18.blog_service.dto.response.BlogResponse;

public interface BlogService {
    List<String> uploadContentImages(List<MultipartFile> files, UserRole authUser);

    BlogResponse createBlog(CreateBlogRequest request, UserRole authUser);

    BlogResponse getBlogById(UUID id, UserRole authUser);

    BlogResponse getBlogBySlug(String slug);

    Page<BlogResponse> getPublishedBlogs(UUID authorId, Pageable pageable);

    Page<BlogResponse> getDraftBlogs(UUID authorId, UserRole authUser, Pageable pageable);

    Page<BlogResponse> getArchivedBlogs(UUID authorId, UserRole authUser, Pageable pageable);

    BlogResponse updateBlog(UUID id, UpdateBlogRequest request, UserRole authUser);

    void deleteBlog(UUID id, UserRole authUser);
}
