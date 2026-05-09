package com.CNTTK18.blog_service.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EditorialTemplateResponse {
    private String key;
    private String name;
    private String description;
    private String language;
    private Integer version;
    private List<String> sections;
    private String defaultContent;
    private List<String> qualityRules;
}
