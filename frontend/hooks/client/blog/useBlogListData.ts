import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { mapBlogApiListToViewModel } from "@/lib/adapters/blogViewAdapter";
import { blogApi } from "@/lib/api/blogApi";
import { BLOG_DATA_SOURCE } from "@/lib/config/publicRuntime";
import { getMockBlogPage } from "@/mocks/blog.mock";
import type { BlogViewFilters, BlogViewModel } from "@/types/blogView.type";

export interface InitialBlogListData {
    blogs: BlogViewModel[];
    totalPages: number;
    page: number;
}

const PAGE_SIZE = 9;

const getBlogTime = (blog: BlogViewModel) =>
    new Date(blog.publishedAt || blog.updatedAt || blog.createdAt || 0).getTime();

const filterApiViewBlogs = (blogs: BlogViewModel[], filters: BlogViewFilters) => {
    const search = filters.search?.trim().toLowerCase() ?? "";
    const category = filters.category?.trim() ?? "";
    return blogs
        .filter((blog) => !category || blog.category === category)
        .filter((blog) => {
            if (!search) return true;
            return [blog.title, blog.excerpt, blog.category, ...blog.tags]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(search);
        })
        .sort((a, b) => {
            if (filters.sort === "oldest") return getBlogTime(a) - getBlogTime(b);
            if (filters.sort === "popular") return (b.views ?? 0) - (a.views ?? 0);
            return getBlogTime(b) - getBlogTime(a);
        });
};

export function useBlogListData(filters: BlogViewFilters, initialData: InitialBlogListData | null = null) {
    const shouldUseInitialData =
        BLOG_DATA_SOURCE === "api" &&
        !!initialData &&
        initialData.page === filters.page &&
        !filters.search &&
        !filters.category &&
        (!filters.sort || filters.sort === "latest");
    const [sourceBlogs, setSourceBlogs] = useState<BlogViewModel[]>(shouldUseInitialData ? initialData.blogs : []);
    const [loading, setLoading] = useState(!shouldUseInitialData);
    const [error, setError] = useState<string | null>(null);

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (BLOG_DATA_SOURCE === "mock") {
                const response = getMockBlogPage({ page: 1, size: 1000, sort: "latest" });
                setSourceBlogs(response.content);
                return;
            }

            const response = await blogApi.getBlogs({ page: 1, size: 1000, sort: "publishedAt,desc" });
            setSourceBlogs(mapBlogApiListToViewModel(response.content ?? []));
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
            toast.error("Failed to load blog posts");
            setSourceBlogs([]);
            setError("Failed to load blog posts");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!shouldUseInitialData || !initialData) return;
        setSourceBlogs(initialData.blogs);
        setLoading(false);
        setError(null);
    }, [initialData, shouldUseInitialData]);

    useEffect(() => {
        if (shouldUseInitialData) return;
        fetchBlogs();
    }, [fetchBlogs, shouldUseInitialData]);

    const search = filters.search;
    const category = filters.category;
    const sort = filters.sort;
    const filteredBlogs = useMemo(
        () => filterApiViewBlogs(sourceBlogs, { search, category, sort }),
        [category, search, sort, sourceBlogs],
    );
    const currentPage = Math.max(1, filters.page ?? 1);
    const totalElements = filteredBlogs.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
    const blogs = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredBlogs.slice(start, start + PAGE_SIZE);
    }, [currentPage, filteredBlogs]);

    return {
        blogs,
        sourceBlogs,
        loading,
        error,
        totalPages,
        totalElements,
        fetchBlogs,
        dataSource: BLOG_DATA_SOURCE,
    };
}
