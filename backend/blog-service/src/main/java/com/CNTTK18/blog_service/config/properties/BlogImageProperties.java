package com.CNTTK18.blog_service.config.properties;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Component
@Data
@ConfigurationProperties(prefix = "blog.image")
public class BlogImageProperties {
    private int maxFilesPerUpload = 10;
    private long maxFileSizeBytes = 5 * 1024 * 1024L;
    private long unusedRetentionHours = 24;
    private int orphanCleanupBatchSize = 50;
    private List<String> allowedContentTypes = List.of("image/jpeg", "image/png", "image/webp", "image/gif");

    public Set<String> getAllowedContentTypesLowerCase() {
        return allowedContentTypes == null
                ? Set.of()
                : allowedContentTypes.stream()
                        .map(type -> type.toLowerCase().trim())
                        .collect(Collectors.toSet());
    }
}
