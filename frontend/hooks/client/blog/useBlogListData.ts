import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { blogApi } from "@/lib/api/blogApi";
import type { Blog, BlogCategory } from "@/types/blog.type";

export interface InitialBlogListData {
    blogs: Blog[];
    totalPages: number;
    page: number;
    category: BlogCategory | "";
    search: string;
}

const isSameQuery = (
    page: number,
    category: BlogCategory | "",
    search: string,
    initialData: InitialBlogListData | null,
) => {
    return (
        !!initialData &&
        initialData.page === page &&
        initialData.category === category &&
        initialData.search === search
    );
};

export function useBlogListData(
    page: number,
    category: BlogCategory | "",
    search: string,
    initialData: InitialBlogListData | null = null,
) {
    const shouldUseInitialData = isSameQuery(page, category, search, initialData);
    const [blogs, setBlogs] = useState<Blog[]>(shouldUseInitialData ? (initialData?.blogs ?? []) : []);
    const [loading, setLoading] = useState(!shouldUseInitialData);
    const [totalPages, setTotalPages] = useState(shouldUseInitialData ? (initialData?.totalPages ?? 1) : 1);

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
