"use client";

import { BlogDetailArticle } from "@/components/client/blog/BlogDetailArticle";
import { BlogDetailLoading } from "@/components/client/blog/BlogDetailLoading";
import { BlogDetailNotFound } from "@/components/client/blog/BlogDetailNotFound";
import type { ComponentProps } from "react";

type BlogDetailArticleProps = ComponentProps<typeof BlogDetailArticle>;

export interface BlogDetailPageViewProps {
    loading: boolean;
    blog: BlogDetailArticleProps["blog"] | null;
    onShare: () => void;
}

export function BlogDetailPageView({ loading, blog, onShare }: BlogDetailPageViewProps) {
    if (loading) return <BlogDetailLoading />;
    if (!blog) return <BlogDetailNotFound />;

    return (
        <div className="min-h-screen bg-white">
            <div className="custom-container py-12">
                <BlogDetailArticle blog={blog} onShare={onShare} />
            </div>
        </div>
    );
}
