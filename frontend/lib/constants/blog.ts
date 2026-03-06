import type { BlogCategory, BlogStatus } from "@/types/blog.type";

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
    recipe: "Recipe",
    review: "Review",
    tips: "Tips",
    news: "News",
    health: "Health",
    other: "Other",
};

export const BRAND_ORANGE = "#EE4D2D";

export const BLOG_CATEGORIES: { value: BlogCategory | ""; label: string; icon: string }[] = [
    { value: "", label: "All", icon: "📚" },
    { value: "recipe", label: "Recipe", icon: "👨‍🍳" },
    { value: "review", label: "Review", icon: "⭐" },
    { value: "tips", label: "Tips", icon: "💡" },
    { value: "news", label: "News", icon: "📰" },
    { value: "health", label: "Health", icon: "💚" },
    { value: "other", label: "Other", icon: "📝" },
];

/** For create/edit forms (no "All") */
export const BLOG_CATEGORIES_FORM: { value: BlogCategory; label: string }[] = [
    { value: "recipe", label: "Recipe" },
    { value: "review", label: "Review" },
    { value: "tips", label: "Tips" },
    { value: "news", label: "News" },
    { value: "health", label: "Health" },
    { value: "other", label: "Other" },
];

export const BLOG_CATEGORIES_SIMPLE: { value: BlogCategory | ""; label: string }[] = [
    { value: "", label: "All" },
    { value: "recipe", label: "Recipe" },
    { value: "review", label: "Review" },
    { value: "tips", label: "Tips" },
    { value: "news", label: "News" },
    { value: "health", label: "Health" },
    { value: "other", label: "Other" },
];

export const BLOG_STATUS_LABELS: Record<BlogStatus, { label: string; color: string }> = {
    draft: { label: "Draft", color: "#6B7280" },
    published: { label: "Published", color: "#10B981" },
    archived: { label: "Archived", color: "#F59E0B" },
};
