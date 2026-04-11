"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useBlogListData, type InitialBlogListData } from "@/hooks/client/blog/useBlogListData";
import { useBlogListFilters } from "@/hooks/client/blog/useBlogListFilters";
import { useBlogListFeatured } from "@/hooks/client/blog/useBlogListFeatured";
import { BlogPageView } from "@/components/client/blog/BlogPageView";

interface BlogPageClientProps {
    initialData?: InitialBlogListData | null;
}

export default function BlogPageClient({ initialData }: BlogPageClientProps) {
    const { authRole } = useAuthStore();
    const canManageBlogs = authRole === "ADMIN" || authRole === "MERCHANT";
    const filters = useBlogListFilters();
    const { blogs, loading, totalPages } = useBlogListData(filters.page, initialData ?? null);
    const { featuredBlog, regularBlogs } = useBlogListFeatured(blogs);

    return (
        <BlogPageView
            canManageBlogs={canManageBlogs}
            loading={loading}
            blogs={blogs}
            totalPages={totalPages}
            page={filters.page}
            featuredBlog={featuredBlog}
            regularBlogs={regularBlogs}
            onPageChange={filters.handlePageChange}
        />
    );
}
