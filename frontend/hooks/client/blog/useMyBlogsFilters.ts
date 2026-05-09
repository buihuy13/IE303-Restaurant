import { useEffect, useState } from "react";
import type { BlogStatus } from "@/types/blog.type";

const normalizeStatusParam = (value: string | null): BlogStatus | "" => {
    const normalized = value?.toUpperCase();
    if (normalized === "DRAFT" || normalized === "PUBLISHED" || normalized === "ARCHIVED") {
        return normalized;
    }
    return "";
};

export function useMyBlogsFilters() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<BlogStatus | "">("");

    useEffect(() => {
        if (typeof window === "undefined") return;
        setStatus(normalizeStatusParam(new URLSearchParams(window.location.search).get("status")));
    }, []);

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
        status,
        handleStatusChange,
        handlePageChange,
    };
}
