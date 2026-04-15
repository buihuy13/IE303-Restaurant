package com.CNTTK18.blog_service.dto.response;

import java.util.UUID;

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
public class BlogMetricsResponse {
    private UUID blogId;
    private Long viewsCount;
    private Long likesCount;
    private Long commentsCount;
    private Boolean likedByCurrentUser;
}
