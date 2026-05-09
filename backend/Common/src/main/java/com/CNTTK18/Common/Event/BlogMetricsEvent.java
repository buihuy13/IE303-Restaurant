package com.CNTTK18.Common.Event;

import java.util.UUID;

public class BlogMetricsEvent {
    private UUID blogId;
    private Long viewsCount;
    private Long likesCount;
    private Long commentsCount;

    public BlogMetricsEvent() {}

    public BlogMetricsEvent(UUID blogId, Long viewsCount, Long likesCount, Long commentsCount) {
        this.blogId = blogId;
        this.viewsCount = viewsCount;
        this.likesCount = likesCount;
        this.commentsCount = commentsCount;
    }

    public UUID getBlogId() {
        return blogId;
    }

    public void setBlogId(UUID blogId) {
        this.blogId = blogId;
    }

    public Long getViewsCount() {
        return viewsCount;
    }

    public void setViewsCount(Long viewsCount) {
        this.viewsCount = viewsCount;
    }

    public Long getLikesCount() {
        return likesCount;
    }

    public void setLikesCount(Long likesCount) {
        this.likesCount = likesCount;
    }

    public Long getCommentsCount() {
        return commentsCount;
    }

    public void setCommentsCount(Long commentsCount) {
        this.commentsCount = commentsCount;
    }
}
