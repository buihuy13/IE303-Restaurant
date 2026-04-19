import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { mapPublicBlogApiListToViewModel } from "@/lib/adapters/blogViewAdapter";
import { blogApi } from "@/lib/api/blogApi";
import { BLOG_DATA_SOURCE } from "@/lib/config/publicRuntime";
import { getMockBlogPage } from "@/mocks/blog.mock";
import type { BlogViewFilters, BlogViewModel } from "@/types/blogView.type";

export interface InitialBlogListData {
    blogs: BlogViewModel[];
    totalPages: number;
    page: number;
}

const PAGE_SIZE = 6;

const toApiSort = (sort?: BlogViewFilters["sort"]) => {
    if (sort === "oldest") return "publishedAt,asc";
    if (sort === "popular") return "viewsCount,desc";
    return "publishedAt,desc";
};

const getBlogTime = (blog: BlogViewModel) =>
    new Date(blog.publishedAt || blog.updatedAt || blog.createdAt || 0).getTime();

const filterApiViewBlogs = (blogs: BlogViewModel[], filters: BlogViewFilters) => {
    const search = filters.search?.trim().toLowerCase() ?? "";
    const category = filters.category?.trim() ?? "";
    return blogs
        .filter((blog) => !category || blog.category === category)
        .filter((blog) => {
            if (!search) return true;
            return blog.title.toLowerCase().includes(search);
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
    const [blogs, setBlogs] = useState<BlogViewModel[]>(shouldUseInitialData ? initialData.blogs : []);
    const [totalPages, setTotalPages] = useState(shouldUseInitialData ? initialData.totalPages : 1);
    const [totalElements, setTotalElements] = useState(shouldUseInitialData ? initialData.blogs.length : 0);
    const [loading, setLoading] = useState(!shouldUseInitialData);
    const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(!shouldUseInitialData);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(shouldUseInitialData);
    const [error, setError] = useState<string | null>(null);
    const requestIdRef = useRef(0);
    const hasCurrentBlogsRef = useRef(blogs.length > 0);
    const loadingDelayRef = useRef<number | null>(null);

    useEffect(() => {
        hasCurrentBlogsRef.current = blogs.length > 0;
    }, [blogs.length]);

    useEffect(() => {
        return () => {
            if (loadingDelayRef.current) {
                window.clearTimeout(loadingDelayRef.current);
            }
        };
    }, []);

    const fetchBlogs = useCallback(async () => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        const hasCurrentBlogs = hasCurrentBlogsRef.current;
        if (loadingDelayRef.current) {
            window.clearTimeout(loadingDelayRef.current);
        }
        setLoading(true);
        if (!hasCurrentBlogs) {
            setShowLoadingSkeleton(true);
        } else {
            loadingDelayRef.current = window.setTimeout(() => {
                if (requestIdRef.current === requestId) {
                    setShowLoadingSkeleton(true);
                }
            }, 150);
        }
        setError(null);
        try {
            if (BLOG_DATA_SOURCE === "mock") {
                const response = getMockBlogPage({ page: 1, size: 1000, sort: "latest" });
                const allBlogs = response.content;
                const filteredBlogs = filterApiViewBlogs(allBlogs, filters);
                const currentPage = Math.max(1, filters.page ?? 1);
                const totalMockPages = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE));
                const start = (currentPage - 1) * PAGE_SIZE;
                if (requestIdRef.current !== requestId) return;
                setSourceBlogs(allBlogs);
                setBlogs(filteredBlogs.slice(start, start + PAGE_SIZE));
                setTotalPages(totalMockPages);
                setTotalElements(filteredBlogs.length);
                setHasLoadedOnce(true);
                return;
            }

            const response = await blogApi.getBlogs({
                page: filters.page ?? 1,
                size: PAGE_SIZE,
                search: filters.search,
                category: filters.category,
                sort: toApiSort(filters.sort),
            });
            const nextBlogs = mapPublicBlogApiListToViewModel(response.content ?? []);
            if (requestIdRef.current !== requestId) return;
            setSourceBlogs(nextBlogs);
            setBlogs(nextBlogs);
            setTotalPages(Math.max(1, response.totalPages || 1));
            setTotalElements(response.totalElements ?? nextBlogs.length);
            setHasLoadedOnce(true);
        } catch (error) {
            if (requestIdRef.current !== requestId) return;
            console.error("Failed to fetch blogs:", error);
            toast.error("Failed to load blog posts");
            setSourceBlogs([]);
            setBlogs([]);
            setTotalPages(1);
            setTotalElements(0);
            setError("Failed to load blog posts");
            setHasLoadedOnce(true);
        } finally {
            if (requestIdRef.current === requestId) {
                if (loadingDelayRef.current) {
                    window.clearTimeout(loadingDelayRef.current);
                    loadingDelayRef.current = null;
                }
                setLoading(false);
                setShowLoadingSkeleton(false);
            }
        }
    }, [filters]);

    useEffect(() => {
        if (!shouldUseInitialData || !initialData) return;
        setSourceBlogs(initialData.blogs);
        setBlogs(initialData.blogs);
        setTotalPages(initialData.totalPages);
        setTotalElements(initialData.blogs.length);
        setLoading(false);
        setShowLoadingSkeleton(false);
        setHasLoadedOnce(true);
        setError(null);
    }, [initialData, shouldUseInitialData]);

    useEffect(() => {
        if (shouldUseInitialData) return;
        fetchBlogs();
    }, [fetchBlogs, shouldUseInitialData]);

    const initialLoading = loading && !hasLoadedOnce;
    const isUpdating = loading && hasLoadedOnce;

    return {
        blogs,
        sourceBlogs,
        loading,
        initialLoading,
        isUpdating,
        showLoadingSkeleton,
        activeSearch: filters.search ?? "",
        error,
        totalPages,
        totalElements,
        fetchBlogs,
        dataSource: BLOG_DATA_SOURCE,
    };
}
