import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";
import { mapPublicBlogApiToViewModel } from "@/lib/adapters/blogViewAdapter";
import { blogApi } from "@/lib/api/blogApi";
import { useAuthStore } from "@/stores/useAuthStore";
import type { BlogViewModel } from "@/types/blogView.type";

const resolveLikesCount = (blog: BlogViewModel | null) => blog?.likes ?? blog?.likesCount ?? 0;

export function useBlogDetailLike(
    blog: BlogViewModel | null,
    setBlog: Dispatch<SetStateAction<BlogViewModel | null>>,
) {
    const { isAuthenticated } = useAuthStore();
    const [liking, setLiking] = useState(false);
    const blogId = blog?.id;

    useEffect(() => {
        if (!blogId || !isAuthenticated) return;

        let ignore = false;
        const refreshLikeState = async () => {
            try {
                const response = await blogApi.getBlogById(blogId);
                if (ignore) return;
                setBlog(mapPublicBlogApiToViewModel(response));
            } catch {
                // Public detail can still render without likedByCurrentUser.
            }
        };

        refreshLikeState();
        return () => {
            ignore = true;
        };
    }, [blogId, isAuthenticated, setBlog]);

    const toggleLike = useCallback(async () => {
        if (!blog || liking) return;
        if (!isAuthenticated) {
            toast.error("Sign in to like this story.");
            return;
        }

        const wasLiked = Boolean(blog.likedByCurrentUser);
        const previousLikes = resolveLikesCount(blog);
        const nextLiked = !wasLiked;
        const nextLikes = Math.max(0, previousLikes + (nextLiked ? 1 : -1));

        setLiking(true);
        setBlog((current) =>
            current
                ? {
                      ...current,
                      likedByCurrentUser: nextLiked,
                      likes: nextLikes,
                      likesCount: nextLikes,
                  }
                : current,
        );

        try {
            const metrics = wasLiked ? await blogApi.unlikeBlog(blog.id) : await blogApi.likeBlog(blog.id);
            setBlog((current) =>
                current
                    ? {
                          ...current,
                          likes: metrics.likesCount,
                          likesCount: metrics.likesCount,
                          commentsCount: metrics.commentsCount,
                          likedByCurrentUser: metrics.likedByCurrentUser,
                      }
                    : current,
            );
        } catch (error: unknown) {
            setBlog((current) =>
                current
                    ? {
                          ...current,
                          likedByCurrentUser: wasLiked,
                          likes: previousLikes,
                          likesCount: previousLikes,
                      }
                    : current,
            );
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status === 401) {
                toast.error("Your sign-in session expired. Please sign in again to like this story.");
            } else if (status === 403) {
                toast.error("Your account is not allowed to like this story.");
            } else {
                toast.error("Unable to update like right now.");
            }
        } finally {
            setLiking(false);
        }
    }, [blog, isAuthenticated, liking, setBlog]);

    return {
        likedByCurrentUser: Boolean(blog?.likedByCurrentUser),
        likesCount: resolveLikesCount(blog),
        liking,
        toggleLike,
    };
}
