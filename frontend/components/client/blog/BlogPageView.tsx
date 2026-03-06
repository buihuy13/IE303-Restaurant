"use client";

import type { ComponentProps } from "react";
import type { BlogCategory } from "@/types/blog.type";
import { BlogListHeader } from "@/components/client/blog/BlogListHeader";
import { BlogListSearch } from "@/components/client/blog/BlogListSearch";
import { BlogListCategories } from "@/components/client/blog/BlogListCategories";
import { BlogListFeatured } from "@/components/client/blog/BlogListFeatured";
import { BlogListGrid } from "@/components/client/blog/BlogListGrid";
import { BlogListEmpty } from "@/components/client/blog/BlogListEmpty";
import { BlogListLoading } from "@/components/client/blog/BlogListLoading";

type BlogListGridProps = ComponentProps<typeof BlogListGrid>;
type BlogListFeaturedProps = ComponentProps<typeof BlogListFeatured>;

type BlogItem = BlogListGridProps["blogs"][number];

export interface BlogPageViewProps {
    isAuthenticated: boolean;
    loading: boolean;
    blogs: BlogItem[];
    totalPages: number;
    page: number;
    searchInput: string;
    category: BlogCategory | "";
    featuredBlog: BlogListFeaturedProps["blog"] | null;
    regularBlogs: BlogItem[];
    onSearchInputChange: (value: string) => void;
    onSearch: () => void;
    onCategoryChange: (category: BlogCategory | "") => void;
    onPageChange: (page: number) => void;
}

export function BlogPageView({
    isAuthenticated,
    loading,
    blogs,
    totalPages,
    page,
    searchInput,
    category,
    featuredBlog,
    regularBlogs,
    onSearchInputChange,
    onSearch,
    onCategoryChange,
    onPageChange,
}: BlogPageViewProps) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
                <div className="mb-10">
                    <BlogListHeader isAuthenticated={!!isAuthenticated} />
                    <BlogListSearch
                        searchInput={searchInput}
                        onSearchInputChange={onSearchInputChange}
                        onSearch={onSearch}
                    />
                    <BlogListCategories category={category} onCategoryChange={onCategoryChange} />
                </div>

                {loading ? (
                    <BlogListLoading />
                ) : blogs.length === 0 ? (
                    <BlogListEmpty />
                ) : (
                    <>
                        {featuredBlog?.featuredImage?.url && <BlogListFeatured blog={featuredBlog} />}
                        {regularBlogs.length > 0 && (
                            <BlogListGrid
                                blogs={regularBlogs}
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

