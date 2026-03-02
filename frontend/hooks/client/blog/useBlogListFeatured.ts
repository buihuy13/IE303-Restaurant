import { useMemo } from "react";
import type { Blog } from "@/types/blog.type";

export function useBlogListFeatured(blogs: Blog[]) {
    const featuredBlog = useMemo(() => {
        if (blogs.length === 0) return null;
        const withImage = blogs.find((b) => b.featuredImage?.url);
        return withImage ?? blogs[0];
    }, [blogs]);

    const regularBlogs = useMemo(() => {
        if (!featuredBlog) return blogs;
        return blogs.filter((b) => b._id !== featuredBlog._id);
    }, [blogs, featuredBlog]);

    return { featuredBlog, regularBlogs };
}
