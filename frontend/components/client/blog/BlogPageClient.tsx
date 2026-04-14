"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBlogListData, type InitialBlogListData } from "@/hooks/client/blog/useBlogListData";
import { useBlogListFilters } from "@/hooks/client/blog/useBlogListFilters";
import { useBlogHeroCarousel } from "@/hooks/client/blog/useBlogHeroCarousel";
import { BlogPageView } from "@/components/client/blog/BlogPageView";
import { mockBlogCategories } from "@/mocks/blog.mock";

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
    const { blogs, sourceBlogs, loading, error, totalPages, dataSource } = useBlogListData(
        requestFilters,
        initialData ?? null,
    );
    const heroCarousel = useBlogHeroCarousel(sourceBlogs);
    const categories = useMemo(() => {
        if (dataSource === "mock") return mockBlogCategories;
        return Array.from(new Set(sourceBlogs.map((blog) => blog.category).filter(Boolean))) as string[];
    }, [dataSource, sourceBlogs]);
    return (
        <BlogPageView
            canManageBlogs={canManageBlogs}
            loading={loading}
            error={error}
            blogs={blogs}
            totalPages={totalPages}
            page={filters.page}
            search={filters.searchInput}
            category={filters.category}
            sort={filters.sort}
            categories={categories}
            heroBlogs={heroCarousel.heroBlogs}
            activeHeroIndex={heroCarousel.activeIndex}
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
