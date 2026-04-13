"use client";

import { BlogDetailArticle } from "@/components/client/blog/BlogDetailArticle";
import { BlogDetailLoading } from "@/components/client/blog/BlogDetailLoading";
import { BlogDetailNotFound } from "@/components/client/blog/BlogDetailNotFound";
import type { ComponentProps } from "react";
import type { BlogViewModel } from "@/types/blogView.type";

type BlogDetailArticleProps = ComponentProps<typeof BlogDetailArticle>;

export interface BlogDetailPageViewProps {
    loading: boolean;
    blog: BlogDetailArticleProps["blog"] | null;
    relatedPosts: BlogViewModel[];
    previousPost: BlogViewModel | null;
    nextPost: BlogViewModel | null;
    readingProgress: number;
    copied: boolean;
    onShare: () => void;
}

export function BlogDetailPageView({
    loading,
    blog,
    relatedPosts,
    previousPost,
    nextPost,
    readingProgress,
    copied,
    onShare,
}: BlogDetailPageViewProps) {
    if (loading) return <BlogDetailLoading />;
    if (!blog) return <BlogDetailNotFound />;

    return (
        <div className="min-h-screen bg-white">
            <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-transparent" aria-hidden="true">
                <div
                    className="h-full bg-brand-orange transition-[width] duration-150"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>
            <div className="custom-container py-12">
                <BlogDetailArticle
                    blog={blog}
                    relatedPosts={relatedPosts}
                    previousPost={previousPost}
                    nextPost={nextPost}
                    copied={copied}
                    onShare={onShare}
                />
            </div>
        </div>
    );
}
