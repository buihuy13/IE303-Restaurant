"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { MyBlogsPageView } from "@/components/client/blog/MyBlogsPageView";
import { useMyBlogsData } from "@/hooks/client/blog/useMyBlogsData";
import { useMyBlogsFilters } from "@/hooks/client/blog/useMyBlogsFilters";
import { useMyBlogsActions } from "@/hooks/client/blog/useMyBlogsActions";
import { useBlogCommentModeration } from "@/hooks/client/blog/useBlogCommentModeration";

export default function MyBlogsPageClient() {
    const router = useRouter();
    const { user, isAuthenticated, authRole, loginWithKeycloak } = useAuthStore();
    const canManageBlogs = authRole === "ADMIN" || authRole === "MERCHANT";
    const filters = useMyBlogsFilters();
    const { blogs, loading, totalPages, stats, fetchMyBlogs } = useMyBlogsData(
        user?.id,
        filters.page,
        filters.status,
    );
    const { handleDelete } = useMyBlogsActions(fetchMyBlogs);
    const commentModeration = useBlogCommentModeration(canManageBlogs && isAuthenticated);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            void loginWithKeycloak({
                redirectPath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/blog/my-blogs",
            });
            return;
        }
        if (!canManageBlogs) {
            router.replace("/blog");
        }
    }, [isAuthenticated, user, canManageBlogs, loginWithKeycloak, router]);

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
            stats={stats}
            page={filters.page}
            status={filters.status}
            deletingId={deletingId}
            commentModeration={commentModeration}
            onStatusChange={filters.handleStatusChange}
            onPageChange={filters.handlePageChange}
            onDelete={onDelete}
        />
    );
}
