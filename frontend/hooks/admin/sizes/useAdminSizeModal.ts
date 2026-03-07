import { useState } from "react";
import type { Size } from "@/types";

export function useAdminSizeModal() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSize, setEditingSize] = useState<Size | null>(null);

    const openCreateModal = () => {
        setEditingSize(null);
        setIsModalOpen(true);
    };

    const openEditModal = (size: Size) => {
        setEditingSize(size);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSize(null);
    };

    return { isModalOpen, editingSize, openCreateModal, openEditModal, closeModal };
}
