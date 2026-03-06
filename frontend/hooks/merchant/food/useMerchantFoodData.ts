import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMerchantRestaurant } from "@/lib/hooks/useMerchantRestaurant";
import { useProductStore } from "@/stores/useProductsStores";

export function useMerchantFoodData() {
    const { currentRestaurant, isLoadingRestaurant, hasRestaurant } = useMerchantRestaurant();
    const { products, loading, fetchProductsByRestaurantId, deleteProduct } = useProductStore();
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [deleteTargetName, setDeleteTargetName] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (currentRestaurant?.id && !isLoadingRestaurant) {
            fetchProductsByRestaurantId(currentRestaurant.id).catch((err) => {
                console.error("Failed to load products:", err);
                toast.error("Unable to load food items list");
            });
        }
    }, [currentRestaurant?.id, isLoadingRestaurant, fetchProductsByRestaurantId]);

    const openDeleteModal = useCallback((id: string, name: string) => {
        setDeleteTargetId(id);
        setDeleteTargetName(name);
    }, []);

    const closeDeleteModal = useCallback(() => {
        if (deleteLoading) return;
        setDeleteTargetId(null);
        setDeleteTargetName(null);
    }, [deleteLoading]);

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTargetId) return;
        try {
            setDeleteLoading(true);
            await deleteProduct(deleteTargetId);
            toast.success("Food item deleted successfully");
            if (currentRestaurant?.id) fetchProductsByRestaurantId(currentRestaurant.id);
            closeDeleteModal();
        } catch (err) {
            console.error("Delete food error:", err);
            toast.error("Failed to delete food item, please try again");
        } finally {
            setDeleteLoading(false);
        }
    }, [deleteTargetId, deleteProduct, currentRestaurant?.id, fetchProductsByRestaurantId, closeDeleteModal]);

    return {
        products,
        loading,
        currentRestaurant,
        isLoadingRestaurant,
        hasRestaurant,
        deleteTargetId,
        deleteTargetName,
        deleteLoading,
        openDeleteModal,
        closeDeleteModal,
        handleConfirmDelete,
    };
}
