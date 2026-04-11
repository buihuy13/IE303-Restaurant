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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="custom-container py-12">
                <div className="mb-10 rounded-3xl border border-gray-200/90 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-7">
                    <BlogListHeader canManageBlogs={canManageBlogs} />
                </div>

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
