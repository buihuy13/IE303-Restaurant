import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { blogApi } from "@/lib/api/blogApi";
import { BLOG_DATA_SOURCE } from "@/lib/config/publicRuntime";
import type { BlogViewModel } from "@/types/blogView.type";

const VIEW_STORAGE_PREFIX = "foodeats.blog.viewed";

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getViewStorageKey = (blogId: string) => `${VIEW_STORAGE_PREFIX}.${blogId}`;

export function useBlogDetailViewTracking(
    blog: BlogViewModel | null,
    setBlog: Dispatch<SetStateAction<BlogViewModel | null>>,
) {
    const blogId = blog?.id;

    useEffect(() => {
        if (!blogId || BLOG_DATA_SOURCE === "mock" || typeof window === "undefined") return;

        const storageKey = getViewStorageKey(blogId);
        const todayKey = getTodayKey();
        if (window.localStorage.getItem(storageKey) === todayKey) return;

        let ignore = false;

        const trackView = async () => {
            try {
                const metrics = await blogApi.incrementBlogView(blogId);
                if (ignore) return;
                window.localStorage.setItem(storageKey, todayKey);
                setBlog((current) =>
                    current && current.id === blogId
                        ? {
                              ...current,
                              views: metrics.viewsCount,
                              viewsCount: metrics.viewsCount,
                              likes: metrics.likesCount,
                              likesCount: metrics.likesCount,
                              commentsCount: metrics.commentsCount,
                          }
                        : current,
                );
            } catch {
                window.localStorage.removeItem(storageKey);
            }
        };

        void trackView();

        return () => {
            ignore = true;
        };
    }, [blogId, setBlog]);
}
