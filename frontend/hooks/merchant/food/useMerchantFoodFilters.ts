import { useMemo, useState } from "react";
import type { Product } from "@/types";

export function useMerchantFoodFilters(products: Product[]) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredFoods = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return products;
        return products.filter(
            (food) =>
                food.productName.toLowerCase().includes(term) ||
                (food.description?.toLowerCase().includes(term) ?? false) ||
                (food.categoryName?.toLowerCase().includes(term) ?? false),
        );
    }, [products, searchTerm]);

    return { searchTerm, setSearchTerm, filteredFoods };
}
