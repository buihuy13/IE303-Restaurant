export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type BlogCommentStatus = "PUBLISHED" | "PENDING" | "HIDDEN";

export interface Blog {
    id: string;
    authorId: string;
    title: string;
    slug: string;
    content: string;
    coverImageUrl?: string | null;
    excerpt?: string | null;
    category?: string | null;
    tags?: string[];
    readTime?: number | null;
    featured?: boolean;
    viewsCount?: number;
    likesCount?: number;
    commentsCount?: number;
    likedByCurrentUser?: boolean;
    authorName?: string | null;
    authorAvatarUrl?: string | null;
    authorRole?: string | null;
    templateKey?: string | null;
    templateVersion?: string | null;
    status: BlogStatus;
    publishedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface BlogCreateRequest {
    title: string;
    content: string;
    coverImageUrl?: string | null;
    status?: Exclude<BlogStatus, "ARCHIVED">;
    excerpt?: string | null;
    category?: string | null;
    tags?: string[];
    readTime?: number | null;
    featured?: boolean;
    templateKey?: string | null;
    templateVersion?: string | null;
}

export interface BlogUpdateRequest {
    title: string;
    content: string;
    coverImageUrl?: string | null;
    status: BlogStatus;
    excerpt?: string | null;
    category?: string | null;
    tags?: string[];
    readTime?: number | null;
    featured?: boolean;
    templateKey?: string | null;
    templateVersion?: string | null;
}

export interface BlogPageResponse {
    content: Blog[];
    pageable?: unknown;
    totalElements: number;
    totalPages: number;
    last?: boolean;
    size: number;
    number: number;
    sort?: unknown;
    numberOfElements?: number;
    first?: boolean;
    empty?: boolean;
}

export interface BlogComment {
    id: string;
    blogId: string;
    authorId?: string | null;
    name: string;
    email?: string | null;
    message: string;
    notify?: boolean;
    status: BlogCommentStatus;
    createdAt?: string | null;
}

export interface BlogCommentPageResponse {
    content: BlogComment[];
    pageable?: unknown;
    totalElements: number;
    totalPages: number;
    last?: boolean;
    size: number;
    number: number;
    sort?: unknown;
    numberOfElements?: number;
    first?: boolean;
    empty?: boolean;
}

export interface BlogCommentCreateRequest {
    message: string;
    notify?: boolean;
}

export interface BlogMetricsResponse {
    blogId: string;
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    likedByCurrentUser: boolean;
    viewCounted?: boolean;
}

export interface BlogPageParams {
    page?: number;
    size?: number;
    authorId?: string;
    search?: string;
    category?: string;
    tag?: string;
    featured?: boolean;
    sort?: string | string[];
}

export interface BlogMessageResponse {
    message: string;
}

export interface BlogImageUploadResponse {
    imageUrls: string[];
}

export interface BlogEditorialTemplate {
    key: string;
    name: string;
    description: string;
    language: string;
    version: number;
    sections: string[];
    defaultContent: string;
    qualityRules: string[];
}

export interface BlogEditorialTemplateRenderRequest {
    title: string;
    topic: string;
    language?: string;
    category?: string | null;
}

export interface BlogEditorialTemplateRenderResponse {
    content: string;
    templateKey: string;
    templateVersion: string;
}
