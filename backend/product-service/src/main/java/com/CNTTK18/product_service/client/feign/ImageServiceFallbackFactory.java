package com.CNTTK18.product_service.client.feign;

import org.springframework.cloud.openfeign.FallbackFactory;

import com.CNTTK18.product_service.client.feign.dto.ImageUploadResponse;

import lombok.extern.slf4j.Slf4j;

// Đảm bảo create product success dù image lỗi
@Slf4j
public class ImageServiceFallbackFactory implements FallbackFactory<ImageServiceFeignClient> {

    @Override
    public ImageServiceFeignClient create(Throwable cause) {
        return new ImageServiceFeignClient() {

            @Override
            public ImageUploadResponse uploadImage(
                    org.springframework.web.multipart.MultipartFile file, String folder) {
                log.error("Image service upload failed: {}", cause.getMessage());
                return ImageUploadResponse.builder().public_id("").url("").build();
            }

            @Override
            public void deleteImage(String publicId) {
                log.error("Image service delete failed: {}", cause.getMessage());
            }
        };
    }
}
