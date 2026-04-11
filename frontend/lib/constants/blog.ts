import type { BlogStatus } from "@/types/blog.type";

export const BRAND_ORANGE = "#EE4D2D";

export const BLOG_STATUS_LABELS: Record<BlogStatus, { label: string; color: string }> = {
    DRAFT: { label: "Draft", color: "#6B7280" },
    PUBLISHED: { label: "Published", color: "#10B981" },
    ARCHIVED: { label: "Archived", color: "#F59E0B" },
};
