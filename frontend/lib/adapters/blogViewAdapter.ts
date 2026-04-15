import { getBlogExcerpt, getReadingTime } from "@/lib/utils/blogText";
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
    }>;

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
        likes: apiBlog.likesCount,
        commentsCount: apiBlog.commentsCount,
        featured: apiBlog.featured ?? false,
        dataSource: "api",
    };
}

export function mapBlogApiListToViewModel(blogs: Blog[]) {
    return blogs.map(mapBlogApiToViewModel);
}

export function mapPublicBlogApiToViewModel(blog: Blog): BlogViewModel {
    return mapBlogApiToViewModel(blog);
}

export function mapPublicBlogApiListToViewModel(blogs: Blog[]) {
    return blogs.map(mapPublicBlogApiToViewModel);
}
