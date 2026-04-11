import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { blogApi } from "@/lib/api/blogApi";
import type { Blog, BlogStatus } from "@/types/blog.type";

const PAGE_SIZE = 12;

const getBlogTime = (blog: Blog) =>
    new Date(blog.updatedAt || blog.publishedAt || blog.createdAt || 0).getTime();

export function useMyBlogsData(userId: string | undefined, page: number, status: BlogStatus | "") {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    const fetchMyBlogs = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            if (status === "PUBLISHED") {
                const response = await blogApi.getBlogs({
                    page,
                    size: PAGE_SIZE,
                    authorId: userId,
                    sort: "publishedAt,desc",
                });
                setBlogs(response.content ?? []);
                setTotalPages(response.totalPages || 1);
                return;
            }

            if (status === "DRAFT") {
                const response = await blogApi.getDraftBlogs({
                    page,
                    size: PAGE_SIZE,
                    authorId: userId,
                    sort: "updatedAt,desc",
                });
                setBlogs(response.content ?? []);
                setTotalPages(response.totalPages || 1);
                return;
            }

            if (status === "ARCHIVED") {
                const response = await blogApi.getArchivedBlogs({
                    page,
                    size: PAGE_SIZE,
                    authorId: userId,
                    sort: "updatedAt,desc",
                });
                setBlogs(response.content ?? []);
                setTotalPages(response.totalPages || 1);
                return;
            }

            const [draftRes, publishedRes, archivedRes] = await Promise.all([
                blogApi.getDraftBlogs({ page: 1, size: 1000, authorId: userId, sort: "updatedAt,desc" }),
                blogApi.getBlogs({ page: 1, size: 1000, authorId: userId, sort: "publishedAt,desc" }),
                blogApi.getArchivedBlogs({ page: 1, size: 1000, authorId: userId, sort: "updatedAt,desc" }),
            ]);
            const all = [
                ...(draftRes.content ?? []),
                ...(publishedRes.content ?? []),
                ...(archivedRes.content ?? []),
            ].sort((a, b) => getBlogTime(b) - getBlogTime(a));
            const start = (page - 1) * PAGE_SIZE;
            setBlogs(all.slice(start, start + PAGE_SIZE));
            setTotalPages(Math.max(1, Math.ceil(all.length / PAGE_SIZE)));
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
            toast.error("Unable to load your articles");
            setBlogs([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [userId, page, status]);

    useEffect(() => {
        if (userId) fetchMyBlogs();
    }, [userId, fetchMyBlogs]);

    return { blogs, loading, totalPages, fetchMyBlogs };
}
