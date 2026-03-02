import { useEffect, useState } from "react";
import type { BlogCategory, BlogStatus } from "@/types/blog.type";

export function useMyBlogsFilters() {
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState<BlogCategory | "">("");
    const [status, setStatus] = useState<BlogStatus | "">("");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        const statusParam = params.get("status");
        if (
            statusParam &&
            (statusParam === "draft" || statusParam === "published" || statusParam === "archived")
        ) {
            setStatus(statusParam as BlogStatus);
        }
    }, []);

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    const handleCategoryChange = (cat: BlogCategory | "") => {
        setCategory(cat);
        setPage(1);
    };

    const handleStatusChange = (stat: BlogStatus | "") => {
        setStatus(stat);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return {
        page,
        category,
        status,
        search,
        searchInput,
        setSearchInput,
        handleSearch,
        handleCategoryChange,
        handleStatusChange,
        handlePageChange,
    };
}
