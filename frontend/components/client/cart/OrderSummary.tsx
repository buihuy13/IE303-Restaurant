"use client";

import { authApi } from "@/lib/api/authApi";
import { saveCheckoutSelection } from "@/lib/checkoutSelection";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CartItem } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Address } from "@/types";
import { Edit2, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Format price to USD
const formatPriceUSD = (priceUSD: number): string => {
    return priceUSD.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

interface OrderSummaryProps {
    subtotal: number;
    selectedItems: CartItem[]; // Kept for future use (e.g., displaying selected items list)
    restaurantId?: string;
    totalItems: number;
}

export const OrderSummary = ({ subtotal, restaurantId, totalItems, selectedItems }: OrderSummaryProps) => {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [voucherCode, setVoucherCode] = useState("");
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    // Fetch user addresses
    useEffect(() => {
        if (user?.id && isAuthenticated) {
            setLoadingAddresses(true);
            authApi
                .getUserAddresses(user.id)
                .then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        setAddresses(data);
                        setSelectedAddressId(data[0].id);
                    }
                })
                .catch((error) => {
                    console.warn("Failed to fetch addresses:", error);
                })
                .finally(() => {
                    setLoadingAddresses(false);
                });
        }
    }, [user?.id, isAuthenticated]);

    const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
    const deliveryAddress =
        selectedAddress?.location || (addresses.length > 0 ? addresses[0].location : "No address saved");

    const shippingFee = 0; // Free shipping for now
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + shippingFee + tax;

    const handleCheckout = () => {
        if (totalItems <= 0 || selectedItems.length === 0) {
            toast.error("Please select items to checkout");
            return;
        }

        if (!restaurantId) {
            toast.error("Please select items from only one restaurant to checkout");
            return;
        }

        saveCheckoutSelection({
            restaurantId,
            itemIds: selectedItems.map((it) => it.id),
        });
        router.push(`/payment?restaurantId=${restaurantId}`);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            {/* Location */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                    <div className="flex-grow min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Deliver to</p>
                        {loadingAddresses ? (
                            <p className="text-sm text-gray-400">Loading address...</p>
                        ) : addresses.length > 0 ? (
                            <>
                                {addresses.length > 1 ? (
                                    <select
                                        value={selectedAddressId || ""}
                                        onChange={(e) => setSelectedAddressId(e.target.value)}
                                        aria-label="Select delivery address"
                                        title="Select delivery address"
                                        className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded-2xl px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/60 bg-white"
                                    >
                                        {addresses.map((addr) => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.location}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{deliveryAddress}</p>
                                )}
                                <Link
                                    href="/account/addresses"
                                    className="text-xs text-brand-orange hover:text-brand-orange/80 mt-1 flex items-center gap-1"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Edit</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-400 italic">No address saved</p>
                                <Link
                                    href="/account/addresses"
                                    className="text-xs text-brand-orange hover:text-brand-orange/80 mt-1 flex items-center gap-1"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Add Address</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Bill Details */}
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">{formatPriceUSD(subtotal)} $</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping Fee</span>
                    <span className="text-gray-900 font-medium">
                        {shippingFee === 0 ? "FREE" : `${formatPriceUSD(shippingFee)} $`}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900 font-medium">{formatPriceUSD(tax)} $</span>
                </div>
            </div>

            {/* Voucher Input */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-xs text-gray-500 mb-2">
                    Vouchers are not available yet (waiting for backend support).
                </p>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Enter voucher code"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        disabled
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-2xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                    <Button
                        onClick={() => toast("Voucher feature coming soon")}
                        disabled
                        variant="secondary"
                        size="sm"
                        className="px-4 cursor-not-allowed rounded-full"
                    >
                        Apply
                    </Button>
                </div>
            </div>

            {/* Total */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-brand-orange">{formatPriceUSD(total)} $</span>
                </div>
            </div>

            {/* Checkout Button */}
            <Button
                type="button"
                onClick={handleCheckout}
                disabled={totalItems <= 0 || !restaurantId}
                variant="brand"
                className="w-full h-12 rounded-full shadow-sm hover:shadow-md disabled:bg-gray-300 disabled:text-white"
            >
                Checkout ({totalItems})
            </Button>
            {totalItems > 0 && !restaurantId && (
                <p className="mt-2 text-xs text-red-500">Please select items from only one restaurant to checkout.</p>
            )}
        </div>
    );
};
