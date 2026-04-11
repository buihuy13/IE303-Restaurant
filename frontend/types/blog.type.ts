export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Blog {
    id: string;
    authorId: string;
    title: string;
    slug: string;
    content: string;
    coverImageUrl?: string | null;
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
}

export interface BlogUpdateRequest {
    title: string;
    content: string;
    coverImageUrl?: string | null;
    status: BlogStatus;
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

export interface BlogPageParams {
    page?: number;
    size?: number;
    authorId?: string;
    sort?: string | string[];
}

export interface BlogMessageResponse {
    message: string;
}

export interface BlogImageUploadResponse {
    imageUrls: string[];
}
