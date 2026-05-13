package com.CNTTK18.image_service.controller;

import java.util.Map;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.image_service.dto.response.MessageResponse;
import com.CNTTK18.image_service.service.ImageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @Tag(name = "Post")
    @Operation(summary = "Upload single image")
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestPart(value = "file", required = true) MultipartFile file,
            @RequestParam(value = "folder", required = false) String folder) {

        validateImageFile(file);
        return new ResponseEntity<>(imageService.uploadImage(file, folder), HttpStatusCode.valueOf(201));
    }

    @Tag(name = "Delete")
    @Operation(summary = "Delete image by public ID")
    @DeleteMapping("/{publicId}")
    public ResponseEntity<MessageResponse> deleteImage(@PathVariable String publicId) {
        imageService.deleteImage(publicId);
        return ResponseEntity.ok(new MessageResponse("Delete Successfully"));
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/"))) {
            throw new RuntimeException("File must be an image");
        }

        // Limit file size to 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds 10MB limit");
        }
    }
}
