"use client";

import type { ComponentProps } from "react";
import { BlogFilterSelect } from "@/components/client/blog/BlogFilterSelect";
import { BlogHeroCarousel } from "@/components/client/blog/BlogHeroCarousel";
import { BlogListHeader } from "@/components/client/blog/BlogListHeader";
import { BlogListGrid, BlogListPagination } from "@/components/client/blog/BlogListGrid";
import { BlogListEmpty } from "@/components/client/blog/BlogListEmpty";
import { BlogListLoading } from "@/components/client/blog/BlogListLoading";
import type { BlogViewFilters } from "@/types/blogView.type";

type BlogListGridProps = ComponentProps<typeof BlogListGrid>;
type BlogItem = BlogListGridProps["blogs"][number];

export interface BlogPageViewProps {
    canManageBlogs: boolean;
    initialLoading: boolean;
    isUpdating: boolean;
    showLoadingSkeleton: boolean;
    activeSearch: string;
    error: string | null;
    blogs: BlogItem[];
    totalPages: number;
    page: number;
    search: string;
    category: string;
    sort: NonNullable<BlogViewFilters["sort"]>;
    categories: string[];
    heroBlogs: BlogItem[];
    activeHeroIndex: number;
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
    initialLoading,
    isUpdating,
    showLoadingSkeleton,
    activeSearch,
    error,
    blogs,
    totalPages,
    page,
    search,
    category,
    sort,
    categories,
    heroBlogs,
    activeHeroIndex,
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
    const showBlockingError = !!error && gridBlogs.length === 0 && heroBlogs.length === 0;
    const quickCategories = [
        "",
        ...Array.from(new Set([...categories.slice(0, 5), category].filter(Boolean))),
    ];
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
    const updatingMessage = activeSearch.trim()
        ? `Searching titles for "${activeSearch.trim()}"...`
        : "Updating stories...";

    return (
        <div className="min-h-screen bg-white">
            <div className="custom-container py-12">
                <BlogListHeader canManageBlogs={canManageBlogs} />

                {initialLoading ? (
                    <BlogListLoading />
                ) : showBlockingError ? (
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

                        <section className="mt-16">
                            <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)] lg:items-end">
                                <div>
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="h-2 w-2 rounded-full bg-brand-orange" />
                                        <p className="text-sm font-bold uppercase text-brand-orange">Story</p>
                                    </div>
                                    <h2 className="max-w-3xl text-4xl font-black uppercase text-brand-orange sm:text-5xl lg:text-6xl">
                                        Latest Articles
                                    </h2>
                                </div>
                                <p className="max-w-xl text-base leading-8 text-gray-600 lg:justify-self-end">
                                    Explore fresh guides, menu notes, and restaurant ideas for people who plan meals with curiosity.
                                </p>
                            </div>

                            <div className="mb-7 grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px]">
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => onSearchChange(event.target.value)}
                                    placeholder="Search article titles..."
                                    className="h-12 rounded-lg border border-gray-300 bg-white px-4 text-sm outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
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

                            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex flex-wrap gap-3">
                                    {quickCategories.map((item) => {
                                        const active = item === category;
                                        return (
                                            <button
                                                key={item || "all"}
                                                type="button"
                                                onClick={() => onCategoryChange(item)}
                                                className={`h-11 rounded-lg px-6 text-sm font-semibold transition ${
                                                    active
                                                        ? "bg-brand-orange text-white shadow-sm"
                                                        : "border border-gray-900/70 bg-white text-gray-700 hover:border-brand-orange hover:text-brand-orange"
                                                }`}
                                            >
                                                {item || "All"}
                                            </button>
                                        );
                                    })}
                                </div>
                                <BlogListPagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={onPageChange}
                                />
                            </div>

                            {isUpdating && (
                                <div className="mb-5 inline-flex items-center gap-3 rounded-lg border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-semibold text-brand-orange">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-brand-orange" />
                                    {updatingMessage}
                                </div>
                            )}

                            <div className="min-h-[720px]">
                                {showLoadingSkeleton && !initialLoading ? (
                                    <BlogArticleGridSkeleton />
                                ) : gridBlogs.length > 0 ? (
                                    <div className={isUpdating ? "opacity-80 transition-opacity" : "transition-opacity"}>
                                        <BlogListGrid blogs={gridBlogs} />
                                    </div>
                                ) : !isUpdating ? (
                                    <BlogListEmpty
                                        title={
                                            activeSearch.trim()
                                                ? "No titles match your search"
                                                : hasActiveFilters
                                                  ? "No stories match your filters"
                                                  : "No posts found"
                                        }
                                        description={
                                            hasActiveFilters
                                                ? "Try another keyword, category, or sort option."
                                                : "Published posts will appear here."
                                        }
                                        actionLabel={hasActiveFilters ? "Clear filters" : undefined}
                                        onAction={hasActiveFilters ? handleClearFilters : undefined}
                                    />
                                ) : (
                                    <div className="min-h-[360px]" />
                                )}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}

function BlogArticleGridSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading articles">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-lg p-4">
                    <div className="aspect-[1.42] w-full animate-pulse rounded-lg bg-orange-100" />
                    <div className="pt-5">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                            <div className="h-1 w-1 rounded-full bg-gray-300" />
                            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                        </div>
                        <div className="mb-3 h-7 w-11/12 animate-pulse rounded bg-gray-200" />
                        <div className="h-7 w-8/12 animate-pulse rounded bg-gray-200" />
                        <div className="mt-6 h-5 w-20 animate-pulse rounded bg-brand-orange/20" />
                    </div>
                </div>
            ))}
        </div>
    );
}
