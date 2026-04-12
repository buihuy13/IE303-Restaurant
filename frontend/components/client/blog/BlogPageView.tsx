"use client";

import type { ComponentProps } from "react";
import { BlogListHeader } from "@/components/client/blog/BlogListHeader";
import { BlogListFeatured } from "@/components/client/blog/BlogListFeatured";
import { BlogListGrid } from "@/components/client/blog/BlogListGrid";
import { BlogListEmpty } from "@/components/client/blog/BlogListEmpty";
import { BlogListLoading } from "@/components/client/blog/BlogListLoading";

type BlogListGridProps = ComponentProps<typeof BlogListGrid>;
type BlogListFeaturedProps = ComponentProps<typeof BlogListFeatured>;
type BlogItem = BlogListGridProps["blogs"][number];

export interface BlogPageViewProps {
    canManageBlogs: boolean;
    loading: boolean;
    blogs: BlogItem[];
    totalPages: number;
    page: number;
    featuredBlog: BlogListFeaturedProps["blog"] | null;
    regularBlogs: BlogItem[];
    onPageChange: (page: number) => void;
}

export function BlogPageView({
    canManageBlogs,
    loading,
    blogs,
    totalPages,
    page,
    featuredBlog,
    regularBlogs,
    onPageChange,
}: BlogPageViewProps) {
    const shouldShowFeatured = !!featuredBlog?.coverImageUrl;
    const gridBlogs = shouldShowFeatured ? regularBlogs : blogs;

    return (
        <div className="min-h-screen bg-white">
            <div className="custom-container py-12">
                <BlogListHeader canManageBlogs={canManageBlogs} />

                {loading ? (
                    <BlogListLoading />
                ) : blogs.length === 0 ? (
                    <BlogListEmpty />
                ) : (
                    <>
                        {shouldShowFeatured && <BlogListFeatured blog={featuredBlog} />}
                        {gridBlogs.length > 0 && (
                            <BlogListGrid
                                blogs={gridBlogs}
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={onPageChange}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
