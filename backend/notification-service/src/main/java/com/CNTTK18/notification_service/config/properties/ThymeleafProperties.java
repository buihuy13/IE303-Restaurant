package com.CNTTK18.notification_service.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "thymeleaf.templates")
public class ThymeleafProperties {
    private String location;
    private String extension;

    public ThymeleafProperties(String location, String extension) {
        this.location = location;
        this.extension = extension;
    }

    public ThymeleafProperties() {}

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getExtension() {
        return extension;
    }

    public void setExtension(String extension) {
        this.extension = extension;
    }
}
