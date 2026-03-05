"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { BlogDetailLoading } from "@/components/client/blog/BlogDetailLoading";
import { BlogDetailNotFound } from "@/components/client/blog/BlogDetailNotFound";
import { BlogDetailArticle } from "@/components/client/blog/BlogDetailArticle";
import { BlogDetailSidebar } from "@/components/client/blog/BlogDetailSidebar";
import { useBlogDetailData } from "@/hooks/client/blog/useBlogDetailData";
import { useBlogDetailLike } from "@/hooks/client/blog/useBlogDetailLike";
import { useBlogDetailTags } from "@/hooks/client/blog/useBlogDetailTags";
import { useBlogDetailShare } from "@/hooks/client/blog/useBlogDetailShare";

export default function BlogDetailPageClient() {
    const params = useParams();
    const slug = params?.slug as string | undefined;
    const { user, isAuthenticated } = useAuthStore();

    const { blog, loading, incrementCommentsCount } = useBlogDetailData(slug, !!isAuthenticated, user?.id);
    const { liked, likesCount, handleLike } = useBlogDetailLike(blog, !!isAuthenticated, user?.id);
    const { allTags } = useBlogDetailTags();
    const { handleShare } = useBlogDetailShare(blog);

    const popularTags = useMemo(() => allTags.slice(0, 10), [allTags]);

    if (loading) return <BlogDetailLoading />;
    if (!blog) return <BlogDetailNotFound />;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <BlogDetailArticle
                        blog={blog}
                        liked={liked}
                        likesCount={likesCount}
                        onLike={handleLike}
                        onShare={handleShare}
                        onCommentAdded={incrementCommentsCount}
                    />
                    <BlogDetailSidebar
                        blogId={blog._id}
                        category={blog.category}
                        popularTags={popularTags}
                    />
                </div>
            </div>
        </div>
    );
}
