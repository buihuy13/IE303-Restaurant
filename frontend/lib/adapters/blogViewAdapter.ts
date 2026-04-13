import { getBlogExcerpt, getReadingTime } from "@/lib/utils/blogText";
import type { Blog } from "@/types/blog.type";
import type { BlogViewModel } from "@/types/blogView.type";

const FALLBACK_AUTHOR_ID = "foodeats-editorial";

export function mapBlogApiToViewModel(blog: Blog): BlogViewModel {
    return {
        ...blog,
        excerpt: getBlogExcerpt(blog.content, 180),
        author: {
            id: blog.authorId || FALLBACK_AUTHOR_ID,
            name: "FoodEats Editorial",
            role: "Editorial Team",
            avatarUrl: null,
        },
        category: undefined,
        tags: [],
        readTime: getReadingTime(blog.content),
        featured: false,
        dataSource: "api",
    };
}

export function mapBlogApiListToViewModel(blogs: Blog[]) {
    return blogs.map(mapBlogApiToViewModel);
}
