import toast from "react-hot-toast";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { authApi } from "@/lib/api/authApi";
import type { User } from "@/types";

export function useAdminUserActions(onDataChanged: () => Promise<void> | void) {
    const confirmAction = useConfirm();

    const handleDeleteUser = async (user: User) => {
        const ok = await confirmAction({
            title: "Delete user?",
            description: `This will permanently delete ${user.username}.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger",
        });
        if (!ok) return;

        try {
            await authApi.deleteUser(user.id);
            toast.success("User deleted.");
            await Promise.resolve(onDataChanged());
        } catch (error) {
            toast.error("Failed to delete user.");
        }
    };

    return { handleDeleteUser };
}

