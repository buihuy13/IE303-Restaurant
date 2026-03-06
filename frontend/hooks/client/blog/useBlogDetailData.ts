import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { blogApi } from "@/lib/api/blogApi";
import type { Blog } from "@/types/blog.type";

export function useBlogDetailData(slug: string | undefined) {
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchBlog = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const response = await blogApi.getBlogBySlug(slug);
            setBlog(response.data);
        } catch (error) {
            console.error("Failed to fetch blog:", error);
            toast.error("Failed to load blog post");
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        if (slug) {
            fetchBlog();
        }
    }, [slug, fetchBlog]);

    const incrementCommentsCount = useCallback(() => {
        setBlog((prev) => {
            if (!prev) return prev;
            return { ...prev, commentsCount: (prev.commentsCount ?? 0) + 1 };
        });
    }, []);

    return { blog, setBlog, loading, fetchBlog, incrementCommentsCount };
}
