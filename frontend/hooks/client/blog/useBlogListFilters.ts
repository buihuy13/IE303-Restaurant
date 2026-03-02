import { useState } from "react";
import type { BlogCategory } from "@/types/blog.type";

export function useBlogListFilters() {
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState<BlogCategory | "">("");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    const handleCategoryChange = (cat: BlogCategory | "") => {
        setCategory(cat);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return {
        page,
        setPage,
        category,
        search,
        searchInput,
        setSearchInput,
        handleSearch,
        handleCategoryChange,
        handlePageChange,
    };
}
