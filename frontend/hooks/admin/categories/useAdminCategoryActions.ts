import toast from "react-hot-toast";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { categoryApi } from "@/lib/api/categoryApi";
import type { Category, CategoryData } from "@/types";

export function useAdminCategoryActions(onDataChanged: () => Promise<void> | void) {
    const confirmAction = useConfirm();

    const handleSaveCategory = async (editingCategory: Category | null, categoryData: CategoryData) => {
        try {
            if (editingCategory) {
                await categoryApi.updateCategory(editingCategory.id, categoryData);
                toast.success("Category updated successfully");
            } else {
                await categoryApi.createCategory(categoryData);
                toast.success("Category added successfully");
            }
            await Promise.resolve(onDataChanged());
        } catch (error) {
            console.error("Failed to save category:", error);
            toast.error("Unable to save category");
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        const ok = await confirmAction({
            title: "Delete category?",
            description: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger",
        });
        if (!ok) return;

        try {
            await categoryApi.deleteCategory(categoryId);
            toast.success("Category deleted successfully");
            await Promise.resolve(onDataChanged());
        } catch (error) {
            console.error("Failed to delete category:", error);
            toast.error("Unable to delete category");
        }
    };

    return {
        handleSaveCategory,
        handleDeleteCategory,
    };
}

