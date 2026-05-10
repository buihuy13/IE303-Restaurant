package com.CNTTK18.restaurant_service.client;

import java.time.Duration;
import java.util.Map;

import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ImageServiceClient {

    private final WebClient.Builder webClientBuilder;

    private static final String IMAGE_SERVICE = "imageService";
    private static final String IMAGE_SERVICE_URL = "http://image-service";

    @CircuitBreaker(name = IMAGE_SERVICE, fallbackMethod = "uploadImageFallback")
    public Map<String, String> uploadImage(org.springframework.web.multipart.MultipartFile file, String folder) {
        WebClient webClient = webClientBuilder.build();

        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
        bodyBuilder
                .part("file", file.getResource())
                .filename(file.getOriginalFilename())
                .contentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);

        if (folder != null) {
            bodyBuilder.part("folder", folder);
        }

        return webClient
                .post()
                .uri(IMAGE_SERVICE_URL + "/api/images/upload")
                .bodyValue(bodyBuilder.build())
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(10))
                .block();
    }

    @CircuitBreaker(name = IMAGE_SERVICE, fallbackMethod = "deleteImageFallback")
    public void deleteImage(String publicId) {
        webClientBuilder
                .build()
                .delete()
                .uri(IMAGE_SERVICE_URL + "/api/images/{publicId}", publicId)
                .retrieve()
                .bodyToMono(Void.class)
                .timeout(Duration.ofSeconds(5))
                .block();
    }

    // Fallback methods
    private Map<String, String> uploadImageFallback(
            org.springframework.web.multipart.MultipartFile file, String folder, Throwable throwable) {
        log.error("Failed to upload image: {}", throwable.getMessage());
        throw new RuntimeException("Failed to upload image. Please try again later.");
    }

    private void deleteImageFallback(String publicId, Throwable throwable) {
        log.error("Failed to delete image {}: {}", publicId, throwable.getMessage());
        // Don't throw exception for delete failures, just log
    }
}
