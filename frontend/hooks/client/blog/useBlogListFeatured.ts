import { useMemo } from "react";
import type { Blog } from "@/types/blog.type";

export function useBlogListFeatured(blogs: Blog[]) {
    const featuredBlog = useMemo(() => {
        if (blogs.length === 0) return null;
        const withImage = blogs.find((blog) => !!blog.coverImageUrl);
        return withImage ?? blogs[0];
    }, [blogs]);

    const regularBlogs = useMemo(() => {
        if (!featuredBlog) return blogs;
        return blogs.filter((blog) => blog.id !== featuredBlog.id);
    }, [blogs, featuredBlog]);

    return { featuredBlog, regularBlogs };
}
