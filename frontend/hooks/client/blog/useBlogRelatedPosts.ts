import { useCallback, useEffect, useState } from "react";
import { mapPublicBlogApiListToViewModel } from "@/lib/adapters/blogViewAdapter";
import { blogApi } from "@/lib/api/blogApi";
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

        try {
            const [relatedResponse, latestResponse] = await Promise.all([
                blogApi.getRelatedBlogs(blog.id, 3),
                blogApi.getBlogs({ page: 1, size: 1000, sort: "publishedAt,desc" }),
            ]);
            const related = mapPublicBlogApiListToViewModel(relatedResponse.content ?? []);
            const publicPosts = mapPublicBlogApiListToViewModel(latestResponse.content ?? []);
            const adjacentPosts = getAdjacentPosts(publicPosts, blog.slug);
            setRelatedPosts(related);
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
