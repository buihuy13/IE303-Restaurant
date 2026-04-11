import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { blogApi } from "@/lib/api/blogApi";
import type { Blog } from "@/types/blog.type";

export interface InitialBlogListData {
    blogs: Blog[];
    totalPages: number;
    page: number;
}

export function useBlogListData(page: number, initialData: InitialBlogListData | null = null) {
    const shouldUseInitialData = !!initialData && initialData.page === page;
    const [blogs, setBlogs] = useState<Blog[]>(shouldUseInitialData ? initialData.blogs : []);
    const [loading, setLoading] = useState(!shouldUseInitialData);
    const [totalPages, setTotalPages] = useState(shouldUseInitialData ? initialData.totalPages : 1);

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await blogApi.getBlogs({
                page,
                size: 12,
                sort: "publishedAt,desc",
            });
            setBlogs(response.content ?? []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
            toast.error("Failed to load blog posts");
            setBlogs([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        if (!shouldUseInitialData || !initialData) return;
        setBlogs(initialData.blogs);
        setTotalPages(initialData.totalPages);
        setLoading(false);
    }, [initialData, shouldUseInitialData]);

    useEffect(() => {
        if (shouldUseInitialData) return;
        fetchBlogs();
    }, [fetchBlogs, shouldUseInitialData]);

    return { blogs, loading, totalPages, fetchBlogs };
}
