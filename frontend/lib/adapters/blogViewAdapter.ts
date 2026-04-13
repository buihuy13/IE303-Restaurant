import { getBlogExcerpt, getReadingTime } from "@/lib/utils/blogText";
import { mockBlogPosts } from "@/mocks/blog.mock";
import type { Blog } from "@/types/blog.type";
import type { BlogViewModel } from "@/types/blogView.type";

const FALLBACK_AUTHOR_ID = "foodeats-editorial";

type BlogApiWithOptionalViewFields = Blog &
    Partial<{
        excerpt: string;
        authorName: string;
        authorAvatarUrl: string | null;
        authorRole: string;
        category: string;
        tags: string[];
        readTime: number;
        views: number;
        viewsCount: number;
        likes: number;
        likesCount: number;
        commentsCount: number;
        featured: boolean;
    }>;

function getDeterministicMockIndex(value: string) {
    return Math.abs([...value].reduce((hash, char) => hash * 31 + char.charCodeAt(0), 0)) % mockBlogPosts.length;
}

function getMockFallback(blog: Blog) {
    return mockBlogPosts[getDeterministicMockIndex(blog.slug || blog.id)];
}

export function mapBlogApiToViewModel(blog: Blog): BlogViewModel {
    const apiBlog = blog as BlogApiWithOptionalViewFields;

    return {
        ...blog,
        excerpt: apiBlog.excerpt || getBlogExcerpt(blog.content, 180),
        author: {
            id: blog.authorId || FALLBACK_AUTHOR_ID,
            name: apiBlog.authorName || "FoodEats Editorial",
            role: apiBlog.authorRole || "Editorial Team",
            avatarUrl: apiBlog.authorAvatarUrl ?? null,
        },
        category: apiBlog.category,
        tags: apiBlog.tags ?? [],
        readTime: apiBlog.readTime ?? getReadingTime(blog.content),
        views: apiBlog.views ?? apiBlog.viewsCount,
        likes: apiBlog.likes ?? apiBlog.likesCount,
        commentsCount: apiBlog.commentsCount,
        featured: apiBlog.featured ?? false,
        dataSource: "api",
    };
}

export function mapBlogApiListToViewModel(blogs: Blog[]) {
    return blogs.map(mapBlogApiToViewModel);
}

export function mapPublicBlogApiToViewModel(blog: Blog): BlogViewModel {
    const base = mapBlogApiToViewModel(blog);
    const fallback = getMockFallback(blog);

    return {
        ...base,
        excerpt: base.excerpt || fallback.excerpt,
        author: base.author.name === "FoodEats Editorial" ? fallback.author : base.author,
        category: base.category ?? fallback.category,
        tags: base.tags.length > 0 ? base.tags : fallback.tags,
        readTime: base.readTime || fallback.readTime,
        views: base.views ?? fallback.views,
        likes: base.likes ?? fallback.likes,
        commentsCount: base.commentsCount ?? fallback.commentsCount,
        featured: base.featured || fallback.featured,
    };
}

export function mapPublicBlogApiListToViewModel(blogs: Blog[]) {
    return blogs.map(mapPublicBlogApiToViewModel);
}
