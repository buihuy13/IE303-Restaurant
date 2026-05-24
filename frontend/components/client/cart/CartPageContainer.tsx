"use client";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { Button } from "@/components/ui/Button";
import { saveCheckoutSelection } from "@/lib/checkoutSelection";
import { CartItem, useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CartItemRow } from "./CartItemRow";
import { OrderSummary } from "./OrderSummary";

// Format price to USD
const formatPriceUSD = (priceUSD: number): string => {
    return priceUSD.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export default function CartPageContainer() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { items, userId, isLoading: cartLoading, setUserId } = useCartStore();
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // Cart hydration is owned by useCartSync in ClientLayout — only align userId here.
    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            return;
        }
        if (userId !== user.id) {
            setUserId(user.id);
        }
    }, [isAuthenticated, user?.id, userId, setUserId]);

    // Select all items when items change
    useEffect(() => {
        if (items.length > 0) {
            const allItemKeys = items.map((item) => `${item.restaurantId}::${item.id}::${item.sizeId || ""}`);
            setSelectedItems(new Set(allItemKeys));
        }
    }, [items]); // When items change

    // Show loading state while fetching cart (especially important when coming from "add to cart")
    // Add a small delay to handle race conditions when user just added an item
    const [showLoading, setShowLoading] = useState(true);
    useEffect(() => {
        if (cartLoading) {
            setShowLoading(true);
            return;
        }

        // Check if we're coming from "add to cart" by checking referrer
        // This helps us give more time for cart to sync when user just added an item
        const isFromAddToCart =
            typeof window !== "undefined" &&
            (document.referrer.includes("/food") ||
                document.referrer.includes("/restaurants") ||
                document.referrer.includes("/restaurant"));

        // Add a delay to ensure cart state is fully updated after fetch completes
        // Longer delay if coming from add to cart to handle backend sync time
        const delay = isFromAddToCart ? 500 : 200;

        const timer = setTimeout(() => {
            setShowLoading(false);
        }, delay);

        return () => clearTimeout(timer);
    }, [cartLoading]);

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    // Group items by restaurant
    const groupedItems = useMemo(() => {
        return items.reduce(
            (acc, item) => {
                const { restaurantId, restaurantName } = item;

                if (!acc[restaurantId]) {
                    acc[restaurantId] = {
                        restaurantName,
                        items: [],
                    };
                }

                acc[restaurantId].items.push(item);

                return acc;
            },
            {} as Record<string, { restaurantName: string; items: CartItem[] }>,
        );
    }, [items]);

    // Get selected items for checkout
    const selectedItemsList = useMemo(() => {
        return items.filter((item) => {
            const itemKey = `${item.restaurantId}::${item.id}::${item.sizeId || ""}`;
            return selectedItems.has(itemKey);
        });
    }, [items, selectedItems]);

    const selectedRestaurantIds = useMemo(() => {
        return new Set(selectedItemsList.map((it) => it.restaurantId));
    }, [selectedItemsList]);

    const selectedRestaurantId = useMemo(() => {
        if (selectedRestaurantIds.size !== 1) return null;
        return Array.from(selectedRestaurantIds)[0];
    }, [selectedRestaurantIds]);

    // Calculate totals for selected items
    const selectedSubtotal = useMemo(() => {
        return selectedItemsList.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [selectedItemsList]);

    const selectedTotalItems = useMemo(() => {
        return selectedItemsList.reduce((total, item) => total + item.quantity, 0);
    }, [selectedItemsList]);

    // Show loading while fetching cart or waiting for state to update
    if (showLoading || cartLoading) {
        return <GlobalLoader label="Loading cart" sublabel="Please wait..." />;
    }

    // Toggle item selection
    const toggleItemSelection = (item: CartItem) => {
        const itemKey = `${item.restaurantId}::${item.id}::${item.sizeId || ""}`;
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemKey)) {
            newSelected.delete(itemKey);
        } else {
            newSelected.add(itemKey);
        }
        setSelectedItems(newSelected);
    };

    // Toggle select all
    const toggleSelectAll = () => {
        if (selectedItems.size === items.length) {
            setSelectedItems(new Set());
        } else {
            const allItemKeys = items.map((item) => `${item.restaurantId}::${item.id}::${item.sizeId || ""}`);
            setSelectedItems(new Set(allItemKeys));
        }
    };

    // Check if cart is empty
    if (items.length === 0 || Object.keys(groupedItems).length === 0) {
        return (
            <div className="custom-container py-8 sm:py-10 md:py-12">
                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        {/* Icon */}
                        <div className="mb-6 p-6 bg-gray-100 rounded-full">
                            <svg
                                className="w-20 h-20 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Empty Cart</h3>

                        {/* Description */}
                        <p className="text-gray-600 mb-8 max-w-md">
                            You haven&apos;t added any food items to your cart yet. Explore restaurants and add
                            delicious dishes to your cart.
                        </p>

                        {/* CTA Button */}
                        <Button asChild variant="brand" className="h-12 px-8 shadow-md hover:shadow-lg">
                            <Link href="/">Go Shopping Now</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const handleCheckout = () => {
        if (selectedItemsList.length === 0) {
            return;
        }
        if (selectedRestaurantIds.size !== 1 || !selectedRestaurantId) {
            return;
        }
        saveCheckoutSelection({
            restaurantId: selectedRestaurantId,
            itemIds: selectedItemsList.map((it) => it.id),
        });
        router.push(`/payment?restaurantId=${selectedRestaurantId}`);
    };

    return (
        <div className="custom-container py-8 sm:py-10 md:py-12">
            {/* Header */}
            <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                Shopping Cart ({totalItems} {totalItems > 1 ? "items" : "item"})
            </h1>

            {/* Desktop: 2 Column Layout */}
            <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                {/* Left Column: Cart Items */}
                <div className="rounded-3xl border border-gray-200/90 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                    {/* Header with Select All */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedItems.size === items.length && items.length > 0}
                                onChange={toggleSelectAll}
                                className="w-5 h-5 text-brand-orange border-gray-300 rounded focus:ring-brand-orange focus:ring-2"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Select All ({selectedItems.size} items)
                            </span>
                        </label>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-gray-100">
                        {Object.entries(groupedItems).map(([restaurantId, group]) => (
                            <div key={restaurantId} className="p-6">
                                {/* Restaurant Name */}
                                <h2 className="text-lg font-semibold tracking-tight text-gray-900 mb-4">
                                    {group.restaurantName}
                                </h2>

                                {/* Items */}
                                {group.items.map((item) => {
                                    const itemKey = `${item.restaurantId}::${item.id}::${item.sizeId || ""}`;
                                    const isSelected = selectedItems.has(itemKey);

                                    return (
                                        <div key={itemKey} className="mb-4 last:mb-0">
                                            <CartItemRow
                                                item={item}
                                                isSelected={isSelected}
                                                onToggleSelect={() => toggleItemSelection(item)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Order Summary (Sticky) */}
                <div className="h-fit lg:sticky lg:top-24">
                    <OrderSummary
                        subtotal={selectedSubtotal}
                        selectedItems={selectedItemsList}
                        restaurantId={selectedRestaurantId || undefined}
                        totalItems={selectedTotalItems}
                    />
                </div>
            </div>

            {/* Mobile: Single Column + Fixed Bottom Bar */}
            <div className="lg:hidden">
                {/* Cart Items */}
                <div className="mb-24 rounded-3xl border border-gray-200/90 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                    {/* Header with Select All */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedItems.size === items.length && items.length > 0}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 text-brand-orange border-gray-300 rounded focus:ring-brand-orange focus:ring-2"
                            />
                            <span className="text-sm font-medium text-gray-700">Select All ({selectedItems.size})</span>
                        </label>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-gray-100">
                        {Object.entries(groupedItems).map(([restaurantId, group]) => (
                            <div key={restaurantId} className="p-4">
                                {/* Restaurant Name */}
                                <h2 className="text-base font-semibold text-gray-900 mb-3">{group.restaurantName}</h2>

                                {/* Items */}
                                {group.items.map((item) => {
                                    const itemKey = `${item.restaurantId}::${item.id}::${item.sizeId || ""}`;
                                    const isSelected = selectedItems.has(itemKey);

                                    return (
                                        <div key={itemKey} className="mb-3 last:mb-0">
                                            <CartItemRow
                                                item={item}
                                                isSelected={isSelected}
                                                onToggleSelect={() => toggleItemSelection(item)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fixed Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/92 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
                    <div className="custom-container py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Total</span>
                                <span className="text-lg font-bold text-brand-orange">
                                    ${formatPriceUSD(selectedSubtotal)}
                                </span>
                            </div>
                            <Button
                                type="button"
                                onClick={handleCheckout}
                                disabled={selectedItemsList.length === 0 || selectedRestaurantIds.size !== 1}
                                variant="brand"
                                className="h-12 px-6 rounded-full shadow-sm hover:shadow-md disabled:bg-gray-300 disabled:text-white"
                            >
                                Checkout ({selectedTotalItems})
                            </Button>
                        </div>
                        {selectedItemsList.length > 0 && selectedRestaurantIds.size > 1 && (
                            <p className="mt-2 text-xs text-red-500">
                                Please select items from only one restaurant to checkout.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
