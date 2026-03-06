import toast from "react-hot-toast";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { restaurantApi } from "@/lib/api/restaurantApi";
import type { Restaurant, RestaurantData } from "@/types";

export function useAdminRestaurantActions(onDataChanged: () => Promise<void> | void) {
    const confirmAction = useConfirm();

    const handleSaveRestaurant = async (editingRestaurant: Restaurant | null, restaurantData: RestaurantData, imageFile?: File) => {
        try {
            if (editingRestaurant) {
                await restaurantApi.updateRestaurant(editingRestaurant.id, restaurantData, imageFile);
                toast.success("Restaurant updated successfully");
            } else {
                await restaurantApi.createRestaurant(restaurantData, imageFile);
                toast.success("New restaurant added successfully");
            }
            await Promise.resolve(onDataChanged());
        } catch (error) {
            console.error("Failed to save restaurant:", error);
            toast.error("Unable to save restaurant");
        }
    };

    const handleToggleStatus = async (restaurant: Restaurant) => {
        try {
            await restaurantApi.updateRestaurantStatus(restaurant.id);
            toast.success("Restaurant status updated successfully");
            await Promise.resolve(onDataChanged());
        } catch (error: unknown) {
            console.error("Failed to toggle status:", error);
            const errorMessage =
                error && typeof error === "object" && "response" in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            toast.error(errorMessage || "Unable to change restaurant status");
        }
    };

    const handleDeleteRestaurant = async (restaurantId: string) => {
        const ok = await confirmAction({
            title: "Delete restaurant?",
            description: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger",
        });
        if (!ok) return;

        try {
            await restaurantApi.deleteRestaurant(restaurantId);
            toast.success("Restaurant deleted successfully");
            await Promise.resolve(onDataChanged());
        } catch (error) {
            console.error("Failed to delete restaurant:", error);
            toast.error("Unable to delete restaurant");
        }
    };

    return {
        handleSaveRestaurant,
        handleToggleStatus,
        handleDeleteRestaurant,
    };
}

