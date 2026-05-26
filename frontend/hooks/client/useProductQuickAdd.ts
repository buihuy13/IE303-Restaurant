"use client";

import {
    fetchProductSizesForCart,
    pickDefaultProductSize,
} from "@/lib/utils/productListDisplay";
import type { Product, ProductSize } from "@/types";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

type RestaurantCartMeta = {
    id: string;
    name: string;
};

type AddItemPayload = {
    id: string;
    name: string;
    price: number;
    image: string;
    restaurantId: string;
    restaurantName: string;
    categoryId: string;
    categoryName: string;
    sizeId: string;
    sizeName: string;
};

type UseProductQuickAddOptions = {
    product: Product;
    cardImageUrl: string;
    restaurantForCart: RestaurantCartMeta | null;
    minPriceFilter?: number | null;
    addItem: (item: AddItemPayload, quantity: number) => Promise<void>;
    onAdded?: () => void;
    requireAuth: () => boolean;
};

export function useProductQuickAdd({
    product,
    cardImageUrl,
    restaurantForCart,
    minPriceFilter = null,
    addItem,
    onAdded,
    requireAuth,
}: UseProductQuickAddOptions) {
    const [isAdding, setIsAdding] = useState(false);
    const [sizePickerOpen, setSizePickerOpen] = useState(false);
    const [pickerSizes, setPickerSizes] = useState<ProductSize[]>([]);

    const resolveSizes = useCallback(async (): Promise<ProductSize[]> => {
        let sizes = product.productSizes ?? [];
        if (sizes.length === 0) {
            sizes = await fetchProductSizesForCart(product.id, { slug: product.slug });
        }
        return sizes;
    }, [product]);

    const addWithSize = useCallback(
        async (size: ProductSize, quantity = 1) => {
            if (!restaurantForCart) {
                toast.error("Restaurant information not found");
                return;
            }

            await addItem(
                {
                    id: product.id,
                    name: product.productName,
                    price: size.price,
                    image: cardImageUrl,
                    restaurantId: restaurantForCart.id,
                    restaurantName: restaurantForCart.name,
                    categoryId: product.categoryId,
                    categoryName: product.categoryName,
                    sizeId: size.id,
                    sizeName: size.sizeName,
                },
                quantity,
            );
            onAdded?.();
            setSizePickerOpen(false);
        },
        [addItem, cardImageUrl, onAdded, product, restaurantForCart],
    );

    const handleQuickAdd = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (isAdding) return;
            if (!requireAuth()) return;

            setIsAdding(true);
            let openedPicker = false;
            try {
                const sizes = await resolveSizes();
                if (sizes.length === 0) {
                    toast.error("This product has no available sizes");
                    return;
                }

                if (sizes.length > 1) {
                    setPickerSizes(sizes);
                    setSizePickerOpen(true);
                    openedPicker = true;
                    return;
                }

                const onlySize = pickDefaultProductSize(sizes, minPriceFilter);
                if (!onlySize) {
                    toast.error("This product has no available sizes");
                    return;
                }

                await addWithSize(onlySize);
            } catch (error) {
                console.error("Failed to add to cart:", error);
            } finally {
                if (openedPicker) {
                    setIsAdding(false);
                    return;
                }
                setTimeout(() => setIsAdding(false), 300);
            }
        },
        [addWithSize, isAdding, minPriceFilter, requireAuth, resolveSizes],
    );

    const handleConfirmSize = useCallback(
        async (size: ProductSize, quantity = 1) => {
            if (isAdding) return;
            setIsAdding(true);
            try {
                await addWithSize(size, quantity);
            } catch (error) {
                console.error("Failed to add to cart:", error);
            } finally {
                setTimeout(() => setIsAdding(false), 300);
            }
        },
        [addWithSize, isAdding],
    );

    return {
        isAdding,
        sizePickerOpen,
        setSizePickerOpen,
        pickerSizes,
        handleQuickAdd,
        handleConfirmSize,
    };
}
