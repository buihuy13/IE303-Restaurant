"use client";

import type { BlogCategory } from "@/types/blog.type";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBlogListData, type InitialBlogListData } from "@/hooks/client/blog/useBlogListData";
import { useBlogListFilters } from "@/hooks/client/blog/useBlogListFilters";
import { useBlogListFeatured } from "@/hooks/client/blog/useBlogListFeatured";
import { BlogPageView } from "@/components/client/blog/BlogPageView";

interface BlogPageClientProps {
    initialData?: InitialBlogListData | null;
}

export default function BlogPageClient({ initialData }: BlogPageClientProps) {
    const { isAuthenticated } = useAuthStore();
    const filters = useBlogListFilters();
    const { blogs, loading, totalPages } = useBlogListData(
        filters.page,
        filters.category,
        filters.search,
        initialData ?? null,
    );
    const { featuredBlog, regularBlogs } = useBlogListFeatured(blogs);

    return (
        <BlogPageView
            isAuthenticated={!!isAuthenticated}
            loading={loading}
            blogs={blogs}
            totalPages={totalPages}
            page={filters.page}
            searchInput={filters.searchInput}
            category={filters.category as BlogCategory | ""}
            featuredBlog={featuredBlog}
            regularBlogs={regularBlogs}
            onSearchInputChange={filters.setSearchInput}
            onSearch={filters.handleSearch}
            onCategoryChange={filters.handleCategoryChange}
            onPageChange={filters.handlePageChange}
        />
    );
}

