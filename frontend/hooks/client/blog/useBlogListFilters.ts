import { useState } from "react";

export function useBlogListFilters() {
    const [page, setPage] = useState(1);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return {
        page,
        setPage,
        handlePageChange,
    };
}
