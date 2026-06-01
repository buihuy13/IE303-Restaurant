"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBlogListData, type InitialBlogListData } from "@/hooks/client/blog/useBlogListData";
import { useBlogListFilters } from "@/hooks/client/blog/useBlogListFilters";
import { useBlogHeroCarousel } from "@/hooks/client/blog/useBlogHeroCarousel";
import { BlogPageView } from "@/components/client/blog/BlogPageView";
import { blogApi } from "@/lib/api/blogApi";
import { mapPublicBlogApiListToViewModel } from "@/lib/adapters/blogViewAdapter";
import type { BlogViewModel } from "@/types/blogView.type";

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
    const {
        blogs,
        initialLoading,
        isUpdating,
        showLoadingSkeleton,
        activeSearch,
        error,
        totalPages,
    } = useBlogListData(requestFilters, initialData ?? null);
    const [featuredBlogs, setFeaturedBlogs] = useState<BlogViewModel[]>([]);
    const [apiCategories, setApiCategories] = useState<string[]>([]);
    const heroCarousel = useBlogHeroCarousel(featuredBlogs);

    useEffect(() => {
        let ignore = false;
        const loadDiscoveryMeta = async () => {
            try {
                const [featuredResponse, categoriesResponse] = await Promise.all([
                    blogApi.getBlogs({ page: 1, size: 3, featured: true, sort: "publishedAt,desc" }),
                    blogApi.getCategories(),
                ]);
                if (ignore) return;
                setFeaturedBlogs(mapPublicBlogApiListToViewModel(featuredResponse.content ?? []));
                setApiCategories(categoriesResponse ?? []);
            } catch (error) {
                if (ignore) return;
                console.error("Failed to load blog discovery metadata:", error);
                setFeaturedBlogs([]);
                setApiCategories([]);
            }
        };

        void loadDiscoveryMeta();
        return () => {
            ignore = true;
        };
    }, []);

    const categories = useMemo(() => apiCategories, [apiCategories]);
    return (
        <BlogPageView
            canManageBlogs={canManageBlogs}
            initialLoading={initialLoading}
            isUpdating={isUpdating}
            showLoadingSkeleton={showLoadingSkeleton}
            activeSearch={activeSearch}
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
