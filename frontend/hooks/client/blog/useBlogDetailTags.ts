import { useCallback, useEffect, useState } from "react";
import { blogApi } from "@/lib/api/blogApi";

export function useBlogDetailTags() {
    const [allTags, setAllTags] = useState<string[]>([]);

    const fetchAllTags = useCallback(async () => {
        try {
            const response = await blogApi.getBlogs({ page: 1, limit: 50 });
            const tags = new Set<string>();
            (response.data ?? []).forEach((b) => {
                if (b.tags?.length) b.tags.forEach((t) => tags.add(t));
            });
            setAllTags(Array.from(tags).slice(0, 20));
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        }
    }, []);

    useEffect(() => {
        fetchAllTags();
    }, [fetchAllTags]);

    return { allTags };
}
