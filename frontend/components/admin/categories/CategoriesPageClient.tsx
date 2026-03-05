"use client";

import CategoryFormModal from "@/components/admin/categories/CategoryFormModal";
import { CategoriesHeader } from "@/components/admin/categories/CategoriesHeader";
import { CategoriesSearch } from "@/components/admin/categories/CategoriesSearch";
import { CategoriesTable } from "@/components/admin/categories/CategoriesTable";
import { useAdminCategoriesData } from "@/hooks/admin/categories/useAdminCategoriesData";
import { useAdminCategoryFilters } from "@/hooks/admin/categories/useAdminCategoryFilters";
import { useAdminCategoryModal } from "@/hooks/admin/categories/useAdminCategoryModal";
import { useAdminCategoryActions } from "@/hooks/admin/categories/useAdminCategoryActions";
import { Edit, Loader2, Plus, Search, Trash } from "lucide-react";

export default function CategoriesPageClient() {
    const { categories, loading, fetchCategories } = useAdminCategoriesData();
    const { searchTerm, setSearchTerm, filteredCategories } = useAdminCategoryFilters(categories);
    const { isModalOpen, editingCategory, openCreateModal, openEditModal, closeModal } = useAdminCategoryModal();
    const { handleSaveCategory, handleDeleteCategory } = useAdminCategoryActions(fetchCategories);

    return (
        <div className="space-y-6">
            <CategoriesHeader total={categories.length} onCreate={openCreateModal} />
            <CategoriesSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <CategoriesTable
                categories={filteredCategories}
                loading={loading}
                onEdit={openEditModal}
                onDelete={handleDeleteCategory}
            />

            {isModalOpen && (
                <CategoryFormModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    category={editingCategory}
                    onSave={(data) => handleSaveCategory(editingCategory, data).then(() => closeModal())}
                />
            )}
        </div>
    );
}

