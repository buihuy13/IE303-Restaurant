import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { blogApi } from "@/lib/api/blogApi";
import type { Blog } from "@/types/blog.type";

export function useBlogDetailLike(
    blog: Blog | null,
    isAuthenticated: boolean,
    userId: string | undefined,
) {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    useEffect(() => {
        if (!blog) return;
        setLikesCount(blog.likesCount ?? blog.likes?.length ?? 0);
        if (isAuthenticated && userId) {
            setLiked(blog.likes?.includes(userId) ?? false);
        }
    }, [blog, isAuthenticated, userId]);

    const handleLike = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to like this post");
            return;
        }
        if (!blog) return;

        const prevLiked = liked;
        const prevCount = likesCount;
        const newLiked = !liked;
        const newCount = newLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

        setLiked(newLiked);
        setLikesCount(newCount);
        toast.success(newLiked ? "Liked post" : "Unliked post");

        try {
            const response = await blogApi.toggleLike(blog._id);
            if (response && typeof response.liked === "boolean" && typeof response.likesCount === "number") {
                setLiked(response.liked);
                setLikesCount(response.likesCount);
            }
        } catch (error) {
            console.error("Failed to toggle like:", error);
            setLiked(prevLiked);
            setLikesCount(prevCount);
            toast.error("Failed to like post. Please try again.");
        }
    };

    return { liked, likesCount, handleLike };
}
