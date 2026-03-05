import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { blogApi } from "@/lib/api/blogApi";
import type { Blog, BlogCategory, BlogStatus } from "@/types/blog.type";

export function useMyBlogsData(
    userId: string | undefined,
    page: number,
    category: BlogCategory | "",
    status: BlogStatus | "",
    search: string,
) {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    const fetchMyBlogs = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const base = { page, limit: 12, authorId: userId };
            const withFilters = { ...base, category: category || undefined, search: search || undefined };

            if (status) {
                const response = await blogApi.getBlogs({ ...withFilters, status });
                setBlogs(response.data ?? []);
                setTotalPages(response.pagination?.pages ?? 1);
            } else {
                const [draftRes, publishedRes, archivedRes] = await Promise.all([
                    blogApi.getBlogs({ ...withFilters, status: "draft", page: 1, limit: 1000 }),
                    blogApi.getBlogs({ ...withFilters, status: "published", page: 1, limit: 1000 }),
                    blogApi.getBlogs({ ...withFilters, status: "archived", page: 1, limit: 1000 }),
                ]);
                const all = [
                    ...(draftRes.data ?? []),
                    ...(publishedRes.data ?? []),
                    ...(archivedRes.data ?? []),
                ];
                all.sort((a, b) => {
                    const tA = new Date(a.createdAt ?? a.publishedAt ?? 0).getTime();
                    const tB = new Date(b.createdAt ?? b.publishedAt ?? 0).getTime();
                    return tB - tA;
                });
                const start = (page - 1) * 12;
                setBlogs(all.slice(start, start + 12));
                setTotalPages(Math.ceil(all.length / 12));
            }
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
            toast.error("Unable to load your articles");
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    }, [userId, page, category, status, search]);

    useEffect(() => {
        if (userId) fetchMyBlogs();
    }, [userId, fetchMyBlogs]);

    return { blogs, loading, totalPages, fetchMyBlogs };
}
