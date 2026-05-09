import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { mapPublicBlogApiListToViewModel } from "@/lib/adapters/blogViewAdapter";
import { blogApi } from "@/lib/api/blogApi";
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

export function useBlogListData(filters: BlogViewFilters, initialData: InitialBlogListData | null = null) {
    const shouldUseInitialData =
        !!initialData &&
        initialData.page === filters.page &&
        !filters.search &&
        !filters.category &&
        (!filters.sort || filters.sort === "latest");
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
            const response = await blogApi.getBlogs({
                page: filters.page ?? 1,
                size: PAGE_SIZE,
                search: filters.search,
                category: filters.category,
                sort: toApiSort(filters.sort),
            });
            const nextBlogs = mapPublicBlogApiListToViewModel(response.content ?? []);
            if (requestIdRef.current !== requestId) return;
            setBlogs(nextBlogs);
            setTotalPages(Math.max(1, response.totalPages || 1));
            setTotalElements(response.totalElements ?? nextBlogs.length);
            setHasLoadedOnce(true);
        } catch (error) {
            if (requestIdRef.current !== requestId) return;
            console.error("Failed to fetch blogs:", error);
            toast.error("Failed to load blog posts");
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
        loading,
        initialLoading,
        isUpdating,
        showLoadingSkeleton,
        activeSearch: filters.search ?? "",
        error,
        totalPages,
        totalElements,
        fetchBlogs,
    };
}
