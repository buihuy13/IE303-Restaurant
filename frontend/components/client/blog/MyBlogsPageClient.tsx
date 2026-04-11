"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { MyBlogsPageView } from "@/components/client/blog/MyBlogsPageView";
import { useMyBlogsData } from "@/hooks/client/blog/useMyBlogsData";
import { useMyBlogsFilters } from "@/hooks/client/blog/useMyBlogsFilters";
import { useMyBlogsActions } from "@/hooks/client/blog/useMyBlogsActions";

export default function MyBlogsPageClient() {
    const router = useRouter();
    const { user, isAuthenticated, authRole } = useAuthStore();
    const canManageBlogs = authRole === "ADMIN" || authRole === "MERCHANT";
    const filters = useMyBlogsFilters();
    const { blogs, loading, totalPages, fetchMyBlogs } = useMyBlogsData(user?.id, filters.page, filters.status);
    const { handleDelete } = useMyBlogsActions(fetchMyBlogs);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.replace("/login");
            return;
        }
        if (!canManageBlogs) {
            router.replace("/blog");
        }
    }, [isAuthenticated, user, canManageBlogs, router]);

    if (!isAuthenticated || !user || !canManageBlogs) return null;

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
            status={filters.status}
            deletingId={deletingId}
            onStatusChange={filters.handleStatusChange}
            onPageChange={filters.handlePageChange}
            onDelete={onDelete}
        />
    );
}
