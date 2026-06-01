import toast from "react-hot-toast";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { sizeApi } from "@/lib/api/sizeApi";
import type { SizeData } from "@/types";

export function useAdminSizeActions(onDataChanged: () => Promise<void> | void) {
    const confirmAction = useConfirm();

    const handleSaveSize = async (editingSize: { id: string } | null, sizeData: SizeData) => {
        try {
            if (editingSize) {
                await sizeApi.updateSize(editingSize.id, sizeData);
                toast.success("Size updated successfully");
            } else {
                await sizeApi.createSize(sizeData);
                toast.success("Size added successfully");
            }
            await Promise.resolve(onDataChanged());
        } catch (error) {
            console.error("Failed to save size:", error);
            toast.error("Unable to save size");
        }
    };

    const handleDeleteSize = async (sizeId: string) => {
        const ok = await confirmAction({
            title: "Delete size?",
            description: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger",
        });
        if (!ok) return;

        try {
            await sizeApi.deleteSize(sizeId);
            toast.success("Size deleted successfully");
            await Promise.resolve(onDataChanged());
        } catch (error) {
            console.error("Failed to delete size:", error);
            toast.error("Unable to delete size");
        }
    };

    return { handleSaveSize, handleDeleteSize };
}
