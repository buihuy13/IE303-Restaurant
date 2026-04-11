import toast from "react-hot-toast";
import type { Blog } from "@/types/blog.type";

export function useBlogDetailShare(blog: Blog | null) {
    const handleShare = async () => {
        if (!blog || typeof window === "undefined") return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: blog.title,
                    text: blog.content.slice(0, 140),
                    url: window.location.href,
                });
            } catch {
                // User cancelled or sharing is unavailable.
            }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied!");
        }
    };
    return { handleShare };
}
