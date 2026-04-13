"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBlogListData, type InitialBlogListData } from "@/hooks/client/blog/useBlogListData";
import { useBlogListFilters } from "@/hooks/client/blog/useBlogListFilters";
import { useBlogHeroCarousel } from "@/hooks/client/blog/useBlogHeroCarousel";
import { BlogPageView } from "@/components/client/blog/BlogPageView";
import { mockBlogCategories, mockBlogTags } from "@/mocks/blog.mock";

interface BlogPageClientProps {
    initialData?: InitialBlogListData | null;
}

export default function BlogPageClient({ initialData }: BlogPageClientProps) {
    const { authRole } = useAuthStore();
    const canManageBlogs = authRole === "ADMIN" || authRole === "MERCHANT";
    const filters = useBlogListFilters();
    const requestFilters = useMemo(
        () => ({
            page: filters.page,
            search: filters.search,
            category: filters.category,
            sort: filters.sort,
        }),
        [filters.category, filters.page, filters.search, filters.sort],
    );
    const { blogs, sourceBlogs, loading, error, totalPages, totalElements, dataSource } = useBlogListData(
        requestFilters,
        initialData ?? null,
    );
    const heroCarousel = useBlogHeroCarousel(sourceBlogs);
    const categories = useMemo(() => {
        if (dataSource === "mock") return mockBlogCategories;
        return Array.from(new Set(sourceBlogs.map((blog) => blog.category).filter(Boolean))) as string[];
    }, [dataSource, sourceBlogs]);
    const tags = useMemo(() => {
        if (dataSource === "mock") return mockBlogTags;
        return Array.from(new Set(sourceBlogs.flatMap((blog) => blog.tags))).slice(0, 12);
    }, [dataSource, sourceBlogs]);

    return (
        <BlogPageView
            canManageBlogs={canManageBlogs}
            loading={loading}
            error={error}
            blogs={blogs}
            totalPages={totalPages}
            totalElements={totalElements}
            page={filters.page}
            search={filters.searchInput}
            category={filters.category}
            sort={filters.sort}
            categories={categories}
            tags={tags}
            dataSource={dataSource}
            heroBlogs={heroCarousel.heroBlogs}
            activeHeroIndex={heroCarousel.activeIndex}
            trendingBlogs={sourceBlogs.slice(0, 4)}
            onHeroNext={heroCarousel.goNext}
            onHeroPrevious={heroCarousel.goPrevious}
            onHeroGoToSlide={heroCarousel.goToSlide}
            onHeroPausedChange={heroCarousel.setPaused}
            onSearchChange={filters.handleSearchChange}
            onCategoryChange={filters.handleCategoryChange}
            onSortChange={filters.handleSortChange}
            onPageChange={filters.handlePageChange}
        />
    );
}
