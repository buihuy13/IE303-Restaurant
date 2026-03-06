"use client";

import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMemo } from "react";
import { BlogDetailPageView } from "@/components/client/blog/BlogDetailPageView";
import { useBlogDetailData } from "@/hooks/client/blog/useBlogDetailData";
import { useBlogDetailLike } from "@/hooks/client/blog/useBlogDetailLike";
import { useBlogDetailTags } from "@/hooks/client/blog/useBlogDetailTags";
import { useBlogDetailShare } from "@/hooks/client/blog/useBlogDetailShare";

export default function BlogDetailPageClient() {
    const params = useParams();
    const slug = params?.slug as string | undefined;
    const { user, isAuthenticated } = useAuthStore();

    const { blog, loading, incrementCommentsCount } = useBlogDetailData(slug);
    const { liked, likesCount, handleLike } = useBlogDetailLike(blog, !!isAuthenticated, user?.id);
    const { allTags } = useBlogDetailTags();
    const { handleShare } = useBlogDetailShare(blog);

    const popularTags = useMemo(() => allTags.slice(0, 10), [allTags]);

    return (
        <BlogDetailPageView
            loading={loading}
            blog={blog}
            liked={liked}
            likesCount={likesCount}
            popularTags={popularTags}
            onLike={handleLike}
            onShare={handleShare}
            onCommentAdded={incrementCommentsCount}
        />
    );
}
