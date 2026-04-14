"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { BlogFilterSelect } from "@/components/client/blog/BlogFilterSelect";
import { BlogHeroCarousel } from "@/components/client/blog/BlogHeroCarousel";
import { BlogListHeader } from "@/components/client/blog/BlogListHeader";
import { BlogListGrid } from "@/components/client/blog/BlogListGrid";
import { BlogListEmpty } from "@/components/client/blog/BlogListEmpty";
import { BlogListLoading } from "@/components/client/blog/BlogListLoading";
import type { BlogViewFilters } from "@/types/blogView.type";

type BlogListGridProps = ComponentProps<typeof BlogListGrid>;
type BlogItem = BlogListGridProps["blogs"][number];

export interface BlogPageViewProps {
    canManageBlogs: boolean;
    loading: boolean;
    error: string | null;
    blogs: BlogItem[];
    totalPages: number;
    page: number;
    search: string;
    category: string;
    sort: NonNullable<BlogViewFilters["sort"]>;
    categories: string[];
    tags: string[];
    heroBlogs: BlogItem[];
    activeHeroIndex: number;
    trendingBlogs: BlogItem[];
    onHeroNext: () => void;
    onHeroPrevious: () => void;
    onHeroGoToSlide: (index: number) => void;
    onHeroPausedChange: (paused: boolean) => void;
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onSortChange: (value: NonNullable<BlogViewFilters["sort"]>) => void;
    onPageChange: (page: number) => void;
}

export function BlogPageView({
    canManageBlogs,
    loading,
    error,
    blogs,
    totalPages,
    page,
    search,
    category,
    sort,
    categories,
    tags,
    heroBlogs,
    activeHeroIndex,
    trendingBlogs,
    onHeroNext,
    onHeroPrevious,
    onHeroGoToSlide,
    onHeroPausedChange,
    onSearchChange,
    onCategoryChange,
    onSortChange,
    onPageChange,
}: BlogPageViewProps) {
    const gridBlogs = blogs;
    const hasActiveFilters = !!search.trim() || !!category || sort !== "latest";
    const categoryOptions = [
        { value: "", label: "All categories" },
        ...categories.map((item) => ({ value: item, label: item })),
    ];
    const sortOptions = [
        { value: "latest", label: "Latest" },
        { value: "oldest", label: "Oldest" },
        { value: "popular", label: "Popular" },
    ];
    const handleClearFilters = () => {
        onSearchChange("");
        onCategoryChange("");
        onSortChange("latest");
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="custom-container py-12">
                <BlogListHeader canManageBlogs={canManageBlogs} />

                {loading ? (
                    <BlogListLoading />
                ) : error ? (
                    <BlogListEmpty
                        title="Unable to load blog posts"
                        description="Please check the blog service and try again."
                    />
                ) : (
                    <>
                        <BlogHeroCarousel
                            blogs={heroBlogs}
                            activeIndex={activeHeroIndex}
                            onNext={onHeroNext}
                            onPrevious={onHeroPrevious}
                            onGoToSlide={onHeroGoToSlide}
                            onPausedChange={onHeroPausedChange}
                        />

                        <div className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                            <div>
                                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_160px]">
                                        <input
                                            type="search"
                                            value={search}
                                            onChange={(event) => onSearchChange(event.target.value)}
                                            placeholder="Search stories, guides, menus..."
                                            className="h-11 rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                                        />
                                        <BlogFilterSelect
                                            label="Filter by category"
                                            value={category}
                                            options={categoryOptions}
                                            onChange={onCategoryChange}
                                        />
                                        <BlogFilterSelect
                                            label="Sort stories"
                                            value={sort}
                                            options={sortOptions}
                                            onChange={(value) => onSortChange(value as NonNullable<BlogViewFilters["sort"]>)}
                                        />
                                    </div>
                                </div>

                                {gridBlogs.length > 0 ? (
                                    <BlogListGrid
                                        blogs={gridBlogs}
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={onPageChange}
                                    />
                                ) : (
                                    <BlogListEmpty
                                        title={hasActiveFilters ? "No stories match your filters" : "No posts found"}
                                        description={
                                            hasActiveFilters
                                                ? "Try another keyword, category, or sort option."
                                                : "Published posts will appear here."
                                        }
                                        actionLabel={hasActiveFilters ? "Clear filters" : undefined}
                                        onAction={hasActiveFilters ? handleClearFilters : undefined}
                                    />
                                )}
                            </div>

                            <aside className="space-y-5">
                                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">Editor Picks</p>
                                    <div className="mt-4 space-y-4">
                                        {trendingBlogs.slice(0, 4).map((blog, index) => (
                                            <Link key={blog.id} href={`/blog/${blog.slug}`} className="group flex gap-3">
                                                <span className="text-lg font-bold text-brand-orange">{String(index + 1).padStart(2, "0")}</span>
                                                <span className="text-sm font-semibold leading-6 text-gray-900 group-hover:text-brand-orange">
                                                    {blog.title}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </section>

                                {tags.length > 0 && (
                                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Kitchen Tags</p>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {tags.map((tag) => (
                                                <span key={tag} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </aside>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
