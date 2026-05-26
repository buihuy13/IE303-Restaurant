"use client";

import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/Button";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function CartDropdown() {
    const { theme } = useClientTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { items: cartItems, removeItem } = useCartStore();

    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const formatPriceVND = (amount: number) => `${Math.round(amount).toLocaleString("vi-VN")} ₫`;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Cart Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/30 ${
                    theme === "dark" ? "hover:bg-white/10" : "hover:bg-gray-50"
                }`}
                aria-label="Shopping cart"
                title="Shopping cart"
            >
                <ShoppingCart className={`w-5 h-5 transition-colors ${theme === "dark" ? "text-white/75 hover:text-white" : "text-gray-700 hover:text-brand-orange"}`} />
                {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center shadow-md">
                        {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className={`absolute right-0 mt-2 w-96 rounded-2xl shadow-2xl border z-50 max-h-[600px] flex flex-col overflow-hidden ${
                    theme === "dark" ? "bg-[#12182b] border-white/12 text-white" : "bg-white border-gray-200/80"
                }`}>
                    {/* Header */}
                    <div className={`flex items-center justify-between p-4 border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                        <h3 className="text-lg font-bold">Shopping Cart ({cartItemCount})</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className={`transition-colors ${theme === "dark" ? "text-white/50 hover:text-white/85" : "text-gray-400 hover:text-gray-600"}`}
                            title="Close cart"
                            aria-label="Close cart"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <ShoppingCart className={`w-16 h-16 mb-4 ${theme === "dark" ? "text-white/30" : "text-gray-300"}`} />
                            <p className={`${theme === "dark" ? "text-white/65" : "text-gray-500"} mb-4`}>Your cart is empty</p>
                            <Button asChild variant="brand" size="sm" className="px-6">
                                <Link href="/search?type=restaurants" onClick={() => setIsOpen(false)}>
                                    Start Shopping
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Items List - Scrollable */}
                            <div className="overflow-y-auto flex-1 max-h-96">
                                {(() => {
                                    // Group items by restaurant
                                    const restaurantGroups = cartItems.reduce(
                                        (acc, item) => {
                                            if (!acc[item.restaurantId]) {
                                                acc[item.restaurantId] = {
                                                    restaurantName: item.restaurantName,
                                                    items: [],
                                                };
                                            }
                                            acc[item.restaurantId].items.push(item);
                                            return acc;
                                        },
                                        {} as Record<string, { restaurantName: string; items: typeof cartItems }>,
                                    );

                                    return Object.entries(restaurantGroups).map(([restaurantId, group]) => (
                                        <div key={restaurantId} className={`border-b last:border-b-0 ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                                            {/* Restaurant Header */}
                                            <div className={`px-4 py-2 border-b ${theme === "dark" ? "bg-white/6 border-white/10" : "bg-gray-50 border-gray-100"}`}>
                                                <h4 className={`text-sm font-semibold ${theme === "dark" ? "text-white/92" : "text-gray-900"}`}>{group.restaurantName}</h4>
                                            </div>
                                            {/* Restaurant Items */}
                                            {group.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={`flex gap-3 p-4 border-b transition-colors last:border-b-0 ${
                                                        theme === "dark" ? "border-white/10 hover:bg-white/6" : "border-gray-100 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {(() => {
                                                        const imageUrl = getImageUrl(item.image);
                                                        const finalImageUrl = imageUrl || "/placeholder.png";

                                                        if (finalImageUrl && finalImageUrl !== "/placeholder.png") {
                                                            return (
                                                                <Image
                                                                    src={finalImageUrl}
                                                                    alt={item.name}
                                                                    width={60}
                                                                    height={60}
                                                                    className="rounded-md object-cover"
                                                                    unoptimized={finalImageUrl.startsWith("http")}
                                                                />
                                                            );
                                                        } else {
                                                            return (
                                                            <div className={`w-[60px] h-[60px] rounded-md flex items-center justify-center text-xs ${
                                                                theme === "dark" ? "bg-white/10 text-white/45" : "bg-gray-200 text-gray-400"
                                                            }`}>
                                                                    No Image
                                                                </div>
                                                            );
                                                        }
                                                    })()}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-semibold text-sm truncate ${theme === "dark" ? "text-white/92" : ""}`}>{item.name}</h4>
                                                        {item.sizeName && (
                                                            <p className={`text-xs ${theme === "dark" ? "text-white/50" : "text-gray-400"}`}>Size: {item.sizeName}</p>
                                                        )}
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className={`text-sm font-semibold ${theme === "dark" ? "text-white/85" : ""}`}>
                                                                {formatPriceVND(item.price)} x {item.quantity}
                                                            </span>
                                                            <span className="text-sm font-bold text-brand-orange">
                                                                {formatPriceVND(item.price * item.quantity)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id, item.restaurantId)}
                                                        className={`transition-colors self-start ${theme === "dark" ? "text-white/45 hover:text-red-400" : "text-gray-400 hover:text-red-500"}`}
                                                        title="Remove item"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ));
                                })()}
                            </div>

                            {/* Footer */}
                            <div className={`p-4 border-t ${theme === "dark" ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`font-semibold text-lg ${theme === "dark" ? "text-white/92" : ""}`}>Total</span>
                                    <span className="font-bold text-xl text-brand-orange">{formatPriceVND(cartTotal)}</span>
                                </div>
                                {(() => {
                                    // Group items by restaurant to determine checkout behavior
                                    const restaurantGroups = cartItems.reduce((acc, item) => {
                                        if (!acc[item.restaurantId]) {
                                            acc[item.restaurantId] = {
                                                restaurantName: item.restaurantName,
                                                items: [],
                                            };
                                        }
                                        acc[item.restaurantId].items.push(item);
                                        return acc;
                                    }, {} as Record<string, { restaurantName: string; items: typeof cartItems }>);

                                    const restaurantIds = Object.keys(restaurantGroups);
                                    const hasMultipleRestaurants = restaurantIds.length > 1;
                                    const firstRestaurantId = restaurantIds[0];

                                    return (
                                        <div className="flex gap-2">
                                            {/* View Cart - Always redirects to cart page where user can checkout each restaurant separately */}
                                            <Button asChild variant="brandOutline" size="sm" className="flex-1">
                                                <Link href="/cart" onClick={() => setIsOpen(false)}>
                                                    View Cart
                                                </Link>
                                            </Button>
                                            {/* Checkout - Only allow if single restaurant, otherwise redirect to cart */}
                                            {hasMultipleRestaurants ? (
                                                <Button
                                                    asChild
                                                    variant="brand"
                                                    size="sm"
                                                    className="flex-1"
                                                    title="Please checkout one restaurant at a time"
                                                >
                                                    <Link href="/cart" onClick={() => setIsOpen(false)}>
                                                        Checkout
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <Button asChild variant="brand" size="sm" className="flex-1">
                                                    <Link
                                                        href={`/payment?restaurantId=${firstRestaurantId}`}
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        Checkout
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
