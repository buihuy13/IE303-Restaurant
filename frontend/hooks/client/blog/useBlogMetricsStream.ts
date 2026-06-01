import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { NOTIFICATION_SSE_ORIGIN } from "@/lib/config/publicRuntime";
import type { BlogMetricsResponse } from "@/types/blog.type";
import type { BlogViewModel } from "@/types/blogView.type";

const parseMetrics = (rawData: string): BlogMetricsResponse | null => {
    try {
        const parsed = JSON.parse(rawData) as BlogMetricsResponse;
        if (!parsed?.blogId) return null;
        return parsed;
    } catch {
        return null;
    }
};

export function useBlogMetricsStream(
    blogId: string | undefined,
    setBlog: Dispatch<SetStateAction<BlogViewModel | null>>,
) {
    useEffect(() => {
        if (!blogId || typeof window === "undefined") return;

        const eventSource = new EventSource(
            `${NOTIFICATION_SSE_ORIGIN}/api/sse/blogs/${blogId}/metrics/stream`,
        );

        const handleMetricsEvent = (event: MessageEvent<string>) => {
            const metrics = parseMetrics(event.data);
            if (!metrics || metrics.blogId !== blogId) return;

            setBlog((current) =>
                current && current.id === blogId
                    ? {
                          ...current,
                          likes: metrics.likesCount,
                          likesCount: metrics.likesCount,
                          commentsCount: metrics.commentsCount,
                      }
                    : current,
            );
        };

        eventSource.addEventListener("INIT", handleMetricsEvent);
        eventSource.addEventListener("BLOG_METRICS_UPDATED", handleMetricsEvent);

        eventSource.onerror = () => {
            // Keep EventSource's built-in reconnect behavior. Metrics are non-critical.
        };

        return () => {
            eventSource.removeEventListener("INIT", handleMetricsEvent);
            eventSource.removeEventListener("BLOG_METRICS_UPDATED", handleMetricsEvent);
            eventSource.close();
        };
    }, [blogId, setBlog]);
}
