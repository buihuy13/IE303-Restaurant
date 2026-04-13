import { useCallback, useEffect, useState } from "react";
import { mapBlogApiListToViewModel } from "@/lib/adapters/blogViewAdapter";
import { blogApi } from "@/lib/api/blogApi";
import { BLOG_DATA_SOURCE } from "@/lib/config/publicRuntime";
import { mockBlogPosts } from "@/mocks/blog.mock";
import type { BlogViewModel } from "@/types/blogView.type";

export function useBlogRelatedPosts(blog: BlogViewModel | null) {
    const [relatedPosts, setRelatedPosts] = useState<BlogViewModel[]>([]);

    const fetchRelatedPosts = useCallback(async () => {
        if (!blog) {
            setRelatedPosts([]);
            return;
        }

        if (BLOG_DATA_SOURCE === "mock") {
            const related = mockBlogPosts
                .filter((post) => post.status === "PUBLISHED" && post.slug !== blog.slug)
                .sort((a, b) => {
                    const categoryScore = Number(b.category === blog.category) - Number(a.category === blog.category);
                    if (categoryScore !== 0) return categoryScore;
                    return (b.views ?? 0) - (a.views ?? 0);
                })
                .slice(0, 3);
            setRelatedPosts(related);
            return;
        }

        try {
            const response = await blogApi.getBlogs({ page: 1, size: 4, sort: "publishedAt,desc" });
            setRelatedPosts(
                mapBlogApiListToViewModel(response.content ?? [])
                    .filter((post) => post.slug !== blog.slug)
                    .slice(0, 3),
            );
        } catch {
            setRelatedPosts([]);
        }
    }, [blog]);

    useEffect(() => {
        fetchRelatedPosts();
    }, [fetchRelatedPosts]);

    return { relatedPosts };
}
