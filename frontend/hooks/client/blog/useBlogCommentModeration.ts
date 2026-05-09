import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { blogApi } from "@/lib/api/blogApi";
import type { BlogComment, BlogCommentStatus } from "@/types/blog.type";

const PAGE_SIZE = 5;

export function useBlogCommentModeration(enabled: boolean) {
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [status, setStatus] = useState<BlogCommentStatus | "">("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        if (!enabled) return;
        setLoading(true);
        try {
            const response = await blogApi.getModerationComments({
                page,
                size: PAGE_SIZE,
                status,
                sort: "createdAt,desc",
            });
            setComments(response.content ?? []);
            setTotalPages(Math.max(1, response.totalPages || 1));
        } catch (error) {
            console.error("Failed to load blog comments for moderation:", error);
            toast.error("Unable to load blog comments");
            setComments([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [enabled, page, status]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleStatusChange = (nextStatus: BlogCommentStatus | "") => {
        setStatus(nextStatus);
        setPage(1);
    };

    const updateStatus = async (commentId: string, nextStatus: BlogCommentStatus) => {
        setUpdatingId(commentId);
        try {
            await blogApi.updateBlogCommentStatus(commentId, nextStatus);
            toast.success(nextStatus === "HIDDEN" ? "Comment hidden" : "Comment restored");
            await fetchComments();
        } catch (error) {
            console.error("Failed to update blog comment status:", error);
            toast.error("Unable to update comment");
        } finally {
            setUpdatingId(null);
        }
    };

    return {
        comments,
        loading,
        page,
        totalPages,
        status,
        updatingId,
        setPage,
        handleStatusChange,
        updateStatus,
        fetchComments,
    };
}
