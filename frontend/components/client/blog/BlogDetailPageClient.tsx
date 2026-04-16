"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { BlogDetailPageView } from "@/components/client/blog/BlogDetailPageView";
import { useBlogDetailData } from "@/hooks/client/blog/useBlogDetailData";
import { useBlogRelatedPosts } from "@/hooks/client/blog/useBlogRelatedPosts";
import { useBlogReadingProgress } from "@/hooks/client/blog/useBlogReadingProgress";
import { useBlogDetailShare } from "@/hooks/client/blog/useBlogDetailShare";
import { useBlogDetailLike } from "@/hooks/client/blog/useBlogDetailLike";

export default function BlogDetailPageClient() {
    const params = useParams();
    const slug = params?.slug as string | undefined;

    const { blog, setBlog, loading } = useBlogDetailData(slug);
    const { copied, handleShare } = useBlogDetailShare(blog);
    const { likedByCurrentUser, liking, toggleLike } = useBlogDetailLike(blog, setBlog);
    const { relatedPosts, previousPost, nextPost } = useBlogRelatedPosts(blog);
    const readingProgress = useBlogReadingProgress(blog?.slug);
    const handleCommentCreated = useCallback(() => {
        setBlog((current) =>
            current
                ? {
                      ...current,
                      commentsCount: (current.commentsCount ?? 0) + 1,
                  }
                : current,
        );
    }, [setBlog]);

    return (
        <BlogDetailPageView
            loading={loading}
            blog={blog}
            relatedPosts={relatedPosts}
            previousPost={previousPost}
            nextPost={nextPost}
            readingProgress={readingProgress}
            copied={copied}
            onShare={handleShare}
            likedByCurrentUser={likedByCurrentUser}
            liking={liking}
            onToggleLike={toggleLike}
            onCommentCreated={handleCommentCreated}
        />
    );
}
