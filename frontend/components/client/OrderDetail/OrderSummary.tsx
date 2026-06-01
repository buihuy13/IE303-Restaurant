"use client";

import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { getImageUrl } from "@/lib/utils";
import { isCanonicalUuid } from "@/lib/utils/uuid";
import { Order } from "@/types/order.type";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";

export const OrderSummary = ({ order }: { order: Order }) => {
    const router = useRouter();
    const { addItem } = useCartStore();
    const { user, isAuthenticated, loginWithKeycloak } = useAuthStore();
    const [isAdding, setIsAdding] = useState(false);
    const isProcessingRef = useRef(false);

    // Format price to VND
    const formatPrice = (amount: number): string => {
        return `${Math.round(amount).toLocaleString("vi-VN")} ₫`;
    };

    const originalPrice = Number(order.totalAmount ?? 0);
    const savings = Number(order.discount ?? 0);
    const shipping = Number(order.deliveryFee ?? 0);
    const tax = Number(order.tax ?? 0);
    const total = Number(order.finalAmount ?? originalPrice - savings + shipping + tax);

    const parseProductIdOptions = (
        productId: string,
    ): { imageURL?: string; sizeId?: string; sizeName?: string; customizations?: string } | null => {
        try {
            const separatorIndex = productId.indexOf("--");
            if (separatorIndex === -1) return null;
            const encoded = productId.slice(separatorIndex + 2);
            const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
            const padded = base64 + "===".slice((base64.length + 3) % 4);
            const binary = atob(padded);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            const json = new TextDecoder().decode(bytes);
            const parsed = JSON.parse(json);
            if (!parsed || typeof parsed !== "object") return null;
            const row = parsed as Record<string, unknown>;
            return {
                imageURL: typeof row.imageURL === "string" ? row.imageURL : undefined,
                sizeId: typeof row.sizeId === "string" ? row.sizeId : undefined,
                sizeName: typeof row.sizeName === "string" ? row.sizeName : undefined,
                customizations: typeof row.customizations === "string" ? row.customizations : undefined,
            };
        } catch {
            return null;
        }
    };

    const handleBuyAgain = useCallback(async () => {
        // Prevent double clicks using both state and ref
        if (isAdding || isProcessingRef.current) return;

        // Set both state and ref immediately to prevent race conditions
        setIsAdding(true);
        isProcessingRef.current = true;

        // Check authentication
        const hasToken =
            typeof window !== "undefined" &&
            (localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"));

        if (!user && !isAuthenticated && !hasToken) {
            toast.error("Please sign in to buy again.");
            setIsAdding(false);
            isProcessingRef.current = false;
            void loginWithKeycloak({
                redirectPath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/",
            });
            return;
        }

        const restaurantId = order.restaurantId || order.restaurant?.id;
        if (!restaurantId) {
            toast.error("Restaurant information not found.");
            setIsAdding(false);
            isProcessingRef.current = false;
            return;
        }

        if (!order.items || order.items.length === 0) {
            toast.error("This order has no items.");
            setIsAdding(false);
            isProcessingRef.current = false;
            return;
        }

        try {
            let successCount = 0;
            let skippedMissingSize = 0;

            // Add all items from order to cart
            for (const item of order.items) {
                try {
                    const parsedOptions = parseProductIdOptions(item.productId);
                    const resolvedSizeId = item.sizeId || parsedOptions?.sizeId;
                    const resolvedSizeName = item.sizeName || parsedOptions?.sizeName;
                    const resolvedCustomizations = item.customizations || parsedOptions?.customizations;

                    if (!resolvedSizeId || !isCanonicalUuid(resolvedSizeId)) {
                        skippedMissingSize += 1;
                        continue;
                    }

                    const imageSource =
                        item.imageURL ||
                        item.cartItemImage ||
                        parsedOptions?.imageURL ||
                        "/placeholder.png";

                    await addItem(
                        {
                            id: item.productId,
                            name: item.productName,
                            price: item.price,
                            image: getImageUrl(imageSource),
                            restaurantId: restaurantId,
                            restaurantName: order.restaurant?.name || "Restaurant",
                            sizeId: resolvedSizeId,
                            sizeName: resolvedSizeName,
                            customizations: resolvedCustomizations,
                        },
                        item.quantity
                    );
                    successCount += 1;
                } catch (itemError) {
                    console.error(`Failed to add item ${item.productName}:`, itemError);
                    // Continue with other items even if one fails
                }
            }

            if (successCount === 0) {
                toast.error("Unable to reorder because items are missing valid size.");
                return;
            }

            // Wait a bit for cart to sync with backend
            await new Promise((resolve) => setTimeout(resolve, 500));

            if (skippedMissingSize > 0) {
                toast.success(`Added ${successCount} item(s). Skipped ${skippedMissingSize} item(s) missing size.`);
            } else {
                toast.success(`Added ${successCount} item(s) to your cart.`);
            }

            // Navigate to checkout page
            router.push(`/payment?restaurantId=${restaurantId}`);
        } catch (error) {
            console.error("Failed to add items to cart:", error);
            toast.error("Failed to add to cart.");
        } finally {
            setIsAdding(false);
            isProcessingRef.current = false;
        }
    }, [isAdding, order, addItem, user, isAuthenticated, router, loginWithKeycloak]);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm w-full lg:sticky lg:top-24">
            <h2 className="text-xl font-bold tracking-tight mb-4 text-gray-900">Order Summary</h2>
            <div className="space-y-3 text-gray-600">
                <div className="flex justify-between">
                    <span>Original Price</span>
                    <span className="text-right">{formatPrice(originalPrice)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Savings</span>
                    <span className="text-right text-green-600">- {formatPrice(savings)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-right">{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Estimated Sales Tax</span>
                    <span className="text-right">{formatPrice(tax)}</span>
                </div>
            </div>
            <div className="flex justify-between font-bold text-2xl mt-4 pt-4 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-brand-orange text-right">{formatPrice(total)}</span>
            </div>
            <button
                onClick={handleBuyAgain}
                disabled={isAdding}
                className="cursor-pointer w-full mt-6 bg-brand-orange text-white font-bold py-3 rounded-full hover:bg-brand-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
                {isAdding ? "Adding..." : "Reorder"}
            </button>
        </div>
    );
};
