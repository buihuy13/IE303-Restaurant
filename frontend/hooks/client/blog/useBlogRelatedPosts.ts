import { useCallback, useEffect, useState } from "react";
import { mapPublicBlogApiListToViewModel } from "@/lib/adapters/blogViewAdapter";
import { blogApi } from "@/lib/api/blogApi";
import { BLOG_DATA_SOURCE } from "@/lib/config/publicRuntime";
import { mockBlogPosts } from "@/mocks/blog.mock";
import type { BlogViewModel } from "@/types/blogView.type";

const getBlogTime = (blog: BlogViewModel) =>
    new Date(blog.publishedAt || blog.updatedAt || blog.createdAt || 0).getTime();

const sortByNewest = (blogs: BlogViewModel[]) => [...blogs].sort((a, b) => getBlogTime(b) - getBlogTime(a));

const getAdjacentPosts = (posts: BlogViewModel[], currentSlug: string) => {
    const sortedPosts = sortByNewest(posts).filter((post) => post.status === "PUBLISHED");
    const currentIndex = sortedPosts.findIndex((post) => post.slug === currentSlug);
    return {
        previousPost: currentIndex > 0 ? sortedPosts[currentIndex - 1] : null,
        nextPost: currentIndex >= 0 && currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null,
    };
};

export function useBlogRelatedPosts(blog: BlogViewModel | null) {
    const [relatedPosts, setRelatedPosts] = useState<BlogViewModel[]>([]);
    const [previousPost, setPreviousPost] = useState<BlogViewModel | null>(null);
    const [nextPost, setNextPost] = useState<BlogViewModel | null>(null);

    const fetchRelatedPosts = useCallback(async () => {
        if (!blog) {
            setRelatedPosts([]);
            setPreviousPost(null);
            setNextPost(null);
            return;
        }

        if (BLOG_DATA_SOURCE === "mock") {
            const publicPosts = sortByNewest(mockBlogPosts.filter((post) => post.status === "PUBLISHED"));
            const related = publicPosts
                .filter((post) => post.slug !== blog.slug)
                .sort((a, b) => {
                    const categoryScore = Number(b.category === blog.category) - Number(a.category === blog.category);
                    if (categoryScore !== 0) return categoryScore;
                    return (b.views ?? 0) - (a.views ?? 0);
                })
                .slice(0, 3);
            const adjacentPosts = getAdjacentPosts(publicPosts, blog.slug);
            setRelatedPosts(related);
            setPreviousPost(adjacentPosts.previousPost);
            setNextPost(adjacentPosts.nextPost);
            return;
        }

        try {
            const response = await blogApi.getBlogs({ page: 1, size: 1000, sort: "publishedAt,desc" });
            const publicPosts = mapPublicBlogApiListToViewModel(response.content ?? []);
            const adjacentPosts = getAdjacentPosts(publicPosts, blog.slug);
            setRelatedPosts(publicPosts.filter((post) => post.slug !== blog.slug).slice(0, 3));
            setPreviousPost(adjacentPosts.previousPost);
            setNextPost(adjacentPosts.nextPost);
        } catch {
            setRelatedPosts([]);
            setPreviousPost(null);
            setNextPost(null);
        }
    }, [blog]);

    useEffect(() => {
        fetchRelatedPosts();
    }, [fetchRelatedPosts]);

    return { relatedPosts, previousPost, nextPost };
}
