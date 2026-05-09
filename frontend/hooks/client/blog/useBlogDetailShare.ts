import { useState } from "react";
import toast from "react-hot-toast";
import type { BlogViewModel } from "@/types/blogView.type";

export function useBlogDetailShare(blog: BlogViewModel | null) {
    const [copied, setCopied] = useState(false);

    const copyLink = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Article link copied");
        window.setTimeout(() => setCopied(false), 1800);
    };

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
            await copyLink();
        }
    };
    return { copied, handleShare };
}
