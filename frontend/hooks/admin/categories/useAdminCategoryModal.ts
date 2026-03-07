import { useState } from "react";
import type { Category } from "@/types";

export function useAdminCategoryModal() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const openCreateModal = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    return {
        isModalOpen,
        editingCategory,
        openCreateModal,
        openEditModal,
        closeModal,
    };
}

