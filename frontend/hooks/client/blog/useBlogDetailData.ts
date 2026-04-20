import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { mapPublicBlogApiToViewModel } from "@/lib/adapters/blogViewAdapter";
import { blogApi } from "@/lib/api/blogApi";
import type { BlogViewModel } from "@/types/blogView.type";

export function useBlogDetailData(slug: string | undefined) {
    const [blog, setBlog] = useState<BlogViewModel | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchBlog = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const response = await blogApi.getBlogBySlug(slug);
            setBlog(mapPublicBlogApiToViewModel(response));
        } catch (error) {
            console.error("Failed to fetch blog:", error);
            setBlog(null);
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

    return { blog, setBlog, loading, fetchBlog };
}
