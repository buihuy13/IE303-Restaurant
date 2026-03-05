import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { blogApi } from "@/lib/api/blogApi";
import type { Blog, BlogCategory } from "@/types/blog.type";

export function useBlogListData(page: number, category: BlogCategory | "", search: string) {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await blogApi.getBlogs({
                page,
                limit: 12,
                category: category || undefined,
                search: search || undefined,
            });
            const sorted = [...(response.data || [])].sort((a, b) => {
                const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
                const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
                return dateB - dateA;
            });
            setBlogs(sorted);
            setTotalPages(response.pagination?.pages ?? 1);
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
            toast.error("Failed to load blog posts");
        } finally {
            setLoading(false);
        }
    }, [page, category, search]);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    return { blogs, loading, totalPages, fetchBlogs };
}
