package com.CNTTK18.blog_service.dto.response;

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
public class EditorialTemplateRenderResponse {
    private String content;
    private String templateKey;
    private String templateVersion;
}
