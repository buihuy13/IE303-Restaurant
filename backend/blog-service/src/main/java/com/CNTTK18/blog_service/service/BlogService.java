package com.CNTTK18.blog_service.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.CNTTK18.blog_service.dto.UserRole;
import com.CNTTK18.blog_service.dto.request.CreateBlogRequest;
import com.CNTTK18.blog_service.dto.request.UpdateBlogRequest;
import com.CNTTK18.blog_service.dto.response.BlogResponse;
import com.CNTTK18.blog_service.model.data.BlogStatus;

public interface BlogService {
    BlogResponse createBlog(CreateBlogRequest request, UserRole authUser);

    BlogResponse getBlogById(UUID id);

    BlogResponse getBlogBySlug(String slug);

    Page<BlogResponse> getBlogs(UUID authorId, BlogStatus status, Pageable pageable);

    BlogResponse updateBlog(UUID id, UpdateBlogRequest request, UserRole authUser);

    void deleteBlog(UUID id, UserRole authUser);
}
