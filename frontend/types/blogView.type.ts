import type { Blog, BlogStatus } from "@/types/blog.type";

export interface BlogAuthorView {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
}

export interface BlogViewModel extends Blog {
    excerpt: string;
    author: BlogAuthorView;
    category?: string;
    tags: string[];
    readTime: number;
    views?: number;
    likes?: number;
    commentsCount?: number;
    featured?: boolean;
}

export interface BlogViewPageResponse {
    content: BlogViewModel[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    empty?: boolean;
}

export interface BlogViewFilters {
    page?: number;
    size?: number;
    search?: string;
    category?: string;
    sort?: "latest" | "oldest" | "popular";
    status?: BlogStatus | "";
}
