"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { MyBlogsPageView } from "@/components/client/blog/MyBlogsPageView";
import { useMyBlogsData } from "@/hooks/client/blog/useMyBlogsData";
import { useMyBlogsFilters } from "@/hooks/client/blog/useMyBlogsFilters";
import { useMyBlogsActions } from "@/hooks/client/blog/useMyBlogsActions";

export default function MyBlogsPageClient() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const filters = useMyBlogsFilters();
    const { blogs, loading, totalPages, fetchMyBlogs } = useMyBlogsData(
        user?.id,
        filters.page,
        filters.category,
        filters.status,
        filters.search,
    );
    const { handleDelete } = useMyBlogsActions(fetchMyBlogs);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    if (!isAuthenticated || !user) {
        router.push("/login");
        return null;
    }

    const onDelete = async (blogId: string, title: string) => {
        setDeletingId(blogId);
        try {
            await handleDelete(blogId, title);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <MyBlogsPageView
            loading={loading}
            blogs={blogs}
            totalPages={totalPages}
            page={filters.page}
            searchInput={filters.searchInput}
            category={filters.category}
            status={filters.status}
            deletingId={deletingId}
            onSearchInputChange={filters.setSearchInput}
            onSearch={filters.handleSearch}
            onCategoryChange={filters.handleCategoryChange}
            onStatusChange={filters.handleStatusChange}
            onPageChange={filters.handlePageChange}
            onDelete={onDelete}
        />
    );
}
