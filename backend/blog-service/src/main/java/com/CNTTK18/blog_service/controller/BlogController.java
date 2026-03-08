package com.CNTTK18.blog_service.controller;

import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.CNTTK18.blog_service.dto.UserRole;
import com.CNTTK18.blog_service.dto.request.CreateBlogRequest;
import com.CNTTK18.blog_service.dto.request.UpdateBlogRequest;
import com.CNTTK18.blog_service.dto.response.BlogResponse;
import com.CNTTK18.blog_service.dto.response.MessageResponse;
import com.CNTTK18.blog_service.service.BlogService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {
    private final BlogService blogService;

    @Tag(name = "Post")
    @Operation(summary = "Create a new blog post")
    @PostMapping("")
    public ResponseEntity<BlogResponse> createBlog(
            @RequestBody @Valid CreateBlogRequest request, @AuthenticationPrincipal UserRole authUser) {
        return new ResponseEntity<>(blogService.createBlog(request, authUser), HttpStatusCode.valueOf(201));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get all published blogs")
    @GetMapping("")
    public ResponseEntity<Page<BlogResponse>> getPublishedBlogs(Pageable pageable) {
        return ResponseEntity.ok(blogService.getPublishedBlogs(pageable));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get draft blogs by author (default current user)")
    @GetMapping("/drafts")
    public ResponseEntity<Page<BlogResponse>> getDraftBlogs(
            @RequestParam(required = false) UUID authorId,
            Pageable pageable,
            @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.getDraftBlogs(authorId, authUser, pageable));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get archived blogs by author (default current user)")
    @GetMapping("/archived")
    public ResponseEntity<Page<BlogResponse>> getArchivedBlogs(
            @RequestParam(required = false) UUID authorId,
            Pageable pageable,
            @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.getArchivedBlogs(authorId, authUser, pageable));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get published blog by slug")
    @GetMapping("/slug/{slug}")
    public ResponseEntity<BlogResponse> getBlogBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(blogService.getBlogBySlug(slug));
    }

    @Tag(name = "Get")
    @Operation(summary = "Get blog by ID")
    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getBlogById(
            @PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.getBlogById(id, authUser));
    }

    @Tag(name = "Put")
    @Operation(summary = "Update blog by ID (full update)")
    @PutMapping("/{id}")
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable UUID id,
            @RequestBody @Valid UpdateBlogRequest request,
            @AuthenticationPrincipal UserRole authUser) {
        return ResponseEntity.ok(blogService.updateBlog(id, request, authUser));
    }

    @Tag(name = "Delete")
    @Operation(summary = "Soft delete blog by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteBlog(
            @PathVariable UUID id, @AuthenticationPrincipal UserRole authUser) {
        blogService.deleteBlog(id, authUser);
        return ResponseEntity.ok(new MessageResponse("Blog archived successfully"));
    }
}
