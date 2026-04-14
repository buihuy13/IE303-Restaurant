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
    loading: boolean;
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
    loading,
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

                        <section className="mt-16">
                            <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)] lg:items-end">
                                <div>
                                    <div className="mb-5 flex items-center gap-3">
                                        <span className="h-2 w-2 rounded-full bg-brand-orange" />
                                        <p className="text-sm font-bold uppercase text-green-900">Story</p>
                                    </div>
                                    <h2 className="max-w-3xl text-4xl font-black uppercase text-brand-green sm:text-5xl lg:text-6xl">
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
                                    placeholder="Search stories, guides, menus..."
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

                            {gridBlogs.length > 0 ? (
                                <BlogListGrid blogs={gridBlogs} />
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
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
