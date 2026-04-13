import { useEffect, useState } from "react";
import type { BlogViewFilters } from "@/types/blogView.type";

export function useBlogListFilters() {
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [sort, setSort] = useState<NonNullable<BlogViewFilters["sort"]>>("latest");

    const resetPage = () => setPage(1);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setSearch(searchInput);
        }, 250);

        return () => window.clearTimeout(timeoutId);
    }, [searchInput]);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        resetPage();
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        resetPage();
    };

    const handleSortChange = (value: NonNullable<BlogViewFilters["sort"]>) => {
        setSort(value);
        resetPage();
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return {
        page,
        setPage,
        search,
        searchInput,
        category,
        sort,
        handleSearchChange,
        handleCategoryChange,
        handleSortChange,
        handlePageChange,
    };
}
