"use client";

import { BlogDetailArticle } from "@/components/client/blog/BlogDetailArticle";
import { BlogDetailLoading } from "@/components/client/blog/BlogDetailLoading";
import { BlogDetailNotFound } from "@/components/client/blog/BlogDetailNotFound";
import { BlogDetailSidebar } from "@/components/client/blog/BlogDetailSidebar";
import type { ComponentProps } from "react";

type BlogDetailArticleProps = ComponentProps<typeof BlogDetailArticle>;
type BlogDetailSidebarProps = ComponentProps<typeof BlogDetailSidebar>;

export interface BlogDetailPageViewProps {
    loading: boolean;
    blog: BlogDetailArticleProps["blog"] | null;
    liked: boolean;
    likesCount: number;
    popularTags: BlogDetailSidebarProps["popularTags"];
    onLike: () => void;
    onShare: () => void;
    onCommentAdded: () => void;
}

export function BlogDetailPageView({
    loading,
    blog,
    liked,
    likesCount,
    popularTags,
    onLike,
    onShare,
    onCommentAdded,
}: BlogDetailPageViewProps) {
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
                        onLike={onLike}
                        onShare={onShare}
                        onCommentAdded={onCommentAdded}
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

