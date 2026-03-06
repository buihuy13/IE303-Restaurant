import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { categoryApi } from "@/lib/api/categoryApi";
import type { Category } from "@/types";

export function useAdminCategoriesData() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await categoryApi.getAllCategories();
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories().catch(() => {
            // error handled above
        });
    }, []);

    return { categories, loading, fetchCategories };
}

