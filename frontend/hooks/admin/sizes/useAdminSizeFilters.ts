import { useMemo, useState } from "react";
import type { Size } from "@/types";

export function useAdminSizeFilters(sizes: Size[]) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredSizes = useMemo(
        () => sizes.filter((size) => size.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [sizes, searchTerm],
    );

    return { searchTerm, setSearchTerm, filteredSizes };
}
