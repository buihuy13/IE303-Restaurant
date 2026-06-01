import { useMemo, useState } from "react";
import type { Category } from "@/types";

export function useAdminCategoryFilters(categories: Category[]) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCategories = useMemo(
        () =>
            categories.filter((category) =>
                category.cateName.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        [categories, searchTerm],
    );

    return {
        searchTerm,
        setSearchTerm,
        filteredCategories,
    };
}

