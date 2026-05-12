package com.CNTTK18.restaurant_service.client.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.CNTTK18.restaurant_service.client.feign.dto.ImageUploadResponse;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

@FeignClient(
        name = "image-service",
        configuration = FeignMultipartSupportConfig.class,
        fallbackFactory = ImageServiceFallbackFactory.class)
public interface ImageServiceFeignClient {

    @PostMapping(value = "/api/images/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @CircuitBreaker(name = "imageService")
    @Retry(name = "imageService")
    ImageUploadResponse uploadImage(
            @RequestPart("file") MultipartFile file, @RequestPart(value = "folder", required = false) String folder);

    @DeleteMapping("/api/images/{publicId}")
    @CircuitBreaker(name = "imageService")
    void deleteImage(@PathVariable("publicId") String publicId);
}
