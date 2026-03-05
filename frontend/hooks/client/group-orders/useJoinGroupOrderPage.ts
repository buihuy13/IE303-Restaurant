import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { groupOrderApi } from "@/lib/api/groupOrderApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { GroupOrderStatus, type GroupOrder, type JoinGroupOrderRequest } from "@/types/groupOrder.type";
import type { Product } from "@/types";

export interface SelectedItem {
    productId: string;
    productName: string;
    sizeId: string;
    sizeName: string;
    price: number;
    quantity: number;
    customizations?: string;
}

export function useJoinGroupOrderPage(
    shareToken: string,
    isAuthenticated: boolean,
    userId: string | undefined,
) {
    const router = useRouter();
    const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());

    const fetchGroupOrder = useCallback(async () => {
        try {
            const data = await groupOrderApi.getGroupOrderByToken(shareToken);
            setGroupOrder(data);
            if (userId) {
                const participant = data.participants.find((p) => p.userId === userId);
                if (participant) {
                    const items = new Map<string, SelectedItem>();
                    participant.items.forEach((item) => {
                        items.set(item.productId, {
                            productId: item.productId,
                            productName: item.productName,
                            sizeId: "",
                            sizeName: "",
                            price: item.price,
                            quantity: item.quantity,
                            customizations: item.customizations,
                        });
                    });
                    setSelectedItems(items);
                }
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
            toast.error(err.response?.data?.message || err.message || "Unable to load the group order.");
            if (err.response?.status === 404) router.push("/");
        } finally {
            setLoading(false);
        }
    }, [shareToken, userId, router]);

    const fetchProducts = useCallback(async () => {
        if (!groupOrder?.restaurantId) return;
        try {
            const response = await restaurantApi.getByRestaurantId(groupOrder.restaurantId);
            setProducts(response.data?.products || []);
        } catch {
            toast.error("Unable to load the menu.");
        }
    }, [groupOrder?.restaurantId]);

    useEffect(() => {
        if (!isAuthenticated || !userId) {
            router.push(`/login?redirect=${encodeURIComponent(`/group-orders/${shareToken}/join`)}`);
            return;
        }
        fetchGroupOrder();
    }, [isAuthenticated, userId, shareToken, router, fetchGroupOrder]);

    useEffect(() => {
        if (groupOrder?.restaurantId) fetchProducts();
    }, [groupOrder?.restaurantId, fetchProducts]);

    const canJoin = useMemo(
        () => groupOrder?.status === GroupOrderStatus.OPEN || groupOrder?.status === GroupOrderStatus.LOCKED,
        [groupOrder?.status],
    );

    const totalAmount = useMemo(
        () =>
            Array.from(selectedItems.values()).reduce((sum, item) => {
                return sum + item.price * item.quantity;
            }, 0),
        [selectedItems],
    );

    const isJoined = useMemo(
        () => !!(userId && groupOrder?.participants.find((p) => p.userId === userId)),
        [groupOrder?.participants, userId],
    );

    const handleAddItem = (product: Product) => {
        if (!canJoin) {
            toast.error("This group order is no longer accepting items.");
            return;
        }
        const defaultSize = product.productSizes?.[0];
        if (!defaultSize) {
            toast.error("This item doesn't have any sizes yet.");
            return;
        }
        const next = new Map(selectedItems);
        const existing = next.get(product.id);
        if (existing) {
            next.set(product.id, { ...existing, quantity: existing.quantity + 1 });
        } else {
            next.set(product.id, {
                productId: product.id,
                productName: product.productName,
                sizeId: defaultSize.id,
                sizeName: defaultSize.sizeName,
                price: defaultSize.price,
                quantity: 1,
            });
        }
        setSelectedItems(next);
    };

    const handleRemoveItem = (productId: string) => {
        const next = new Map(selectedItems);
        const item = next.get(productId);
        if (!item) return;
        if (item.quantity > 1) next.set(productId, { ...item, quantity: item.quantity - 1 });
        else next.delete(productId);
        setSelectedItems(next);
    };

    const handleSubmit = async () => {
        if (selectedItems.size === 0) {
            toast.error("Please select at least one item.");
            return;
        }
        if (!canJoin) {
            toast.error("This group order is no longer accepting items.");
            return;
        }
        setIsSubmitting(true);
        try {
            const items: JoinGroupOrderRequest["items"] = Array.from(selectedItems.values()).map((item) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
                customizations: item.customizations,
            }));
            await groupOrderApi.joinGroupOrder(shareToken, { items });
            toast.success("You joined the group order successfully!");
            router.push(`/group-orders/${shareToken}`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || err.message || "Unable to join the group order.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        groupOrder,
        products,
        loading,
        isSubmitting,
        selectedItems,
        canJoin: !!canJoin,
        totalAmount,
        isJoined,
        handleAddItem,
        handleRemoveItem,
        handleSubmit,
    };
}
