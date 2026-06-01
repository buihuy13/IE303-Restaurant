import toast from "react-hot-toast";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { blogApi } from "@/lib/api/blogApi";

export function useMyBlogsActions(onDeleted: () => void) {
    const confirmAction = useConfirm();

    const handleDelete = async (blogId: string, title: string) => {
        const ok = await confirmAction({
            title: "Archive blog?",
            description: `Archive "${title}"? You can still find it in archived posts.`,
            confirmText: "Archive",
            cancelText: "Cancel",
            variant: "danger",
        });
        if (!ok) return;

        try {
            await blogApi.deleteBlog(blogId);
            toast.success("Blog archived successfully");
            onDeleted();
        } catch (error: unknown) {
            console.error("Failed to delete blog:", error);
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(msg ?? "Failed to delete blog");
            throw error;
        }
    };

    return { handleDelete };
}
