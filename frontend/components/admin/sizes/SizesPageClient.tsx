"use client";

import SizeFormModal from "@/components/admin/sizes/SizeFormModal";
import { SizesHeader } from "@/components/admin/sizes/SizesHeader";
import { SizesSearch } from "@/components/admin/sizes/SizesSearch";
import { SizesTable } from "@/components/admin/sizes/SizesTable";
import { useAdminSizesData } from "@/hooks/admin/sizes/useAdminSizesData";
import { useAdminSizeFilters } from "@/hooks/admin/sizes/useAdminSizeFilters";
import { useAdminSizeModal } from "@/hooks/admin/sizes/useAdminSizeModal";
import { useAdminSizeActions } from "@/hooks/admin/sizes/useAdminSizeActions";

export default function SizesPageClient() {
    const { sizes, loading, fetchSizes } = useAdminSizesData();
    const { searchTerm, setSearchTerm, filteredSizes } = useAdminSizeFilters(sizes);
    const { isModalOpen, editingSize, openCreateModal, openEditModal, closeModal } = useAdminSizeModal();
    const { handleSaveSize, handleDeleteSize } = useAdminSizeActions(fetchSizes);

    return (
        <div className="space-y-6">
            <SizesHeader total={sizes.length} onCreate={openCreateModal} />
            <SizesSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <SizesTable
                sizes={filteredSizes}
                loading={loading}
                onEdit={openEditModal}
                onDelete={handleDeleteSize}
            />

            {isModalOpen && (
                <SizeFormModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    size={editingSize}
                    onSave={(data) => handleSaveSize(editingSize, data).then(() => closeModal())}
                />
            )}
        </div>
    );
}
