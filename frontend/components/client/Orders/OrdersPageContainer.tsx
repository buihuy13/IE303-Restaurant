"use client";

import { getImageUrl } from "@/lib/utils";
import { isCanonicalUuid } from "@/lib/utils/uuid";
import { formatCurrency } from "@/lib/utils/dashboardFormat";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { OrderStatus } from "@/types/order.type";
import { Package, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import OrderHistorySidebar from "./OrderHistorySidebar";
import { type OrderListItem } from "./OrderItemRow";
import { OrderSkeleton } from "./OrderSkeleton";

// Helper function to parse encoded options from productId (image/size/customizations)
const parseProductIdOptions = (
    productId: string,
): { imageURL?: string; sizeId?: string; sizeName?: string; customizations?: string } | null => {
    try {
        const separatorIndex = productId.indexOf("--");
        if (separatorIndex === -1) {
            return null;
        }
        
        const encoded = productId.slice(separatorIndex + 2);
        // Base64 URL decode
        const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "===".slice((base64.length + 3) % 4);
        const binary = atob(padded);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const json = new TextDecoder().decode(bytes);
        const parsed = JSON.parse(json);
        if (parsed && typeof parsed === "object") {
            const record = parsed as Record<string, unknown>;
            return {
                imageURL: typeof record.imageURL === "string" ? record.imageURL : undefined,
                sizeId: typeof record.sizeId === "string" ? record.sizeId : undefined,
                sizeName: typeof record.sizeName === "string" ? record.sizeName : undefined,
                customizations: typeof record.customizations === "string" ? record.customizations : undefined,
            };
        }
    } catch (error) {
        console.debug("[Reorder] Failed to parse productId options:", error);
    }
    return null;
};

export interface OrdersPageOrder {
    id: string;
    slug?: string; // Order slug for URL routing
    createdAt: string;
    totalAmount: number;
    items: OrderListItem[];
    status?: OrderStatus;
    paymentStatus?: string;
}

interface OrdersPageContainerProps {
    orders: OrdersPageOrder[];
    isLoading: boolean;
    onRetry?: () => void;
    onSortChange?: (sortBy: string) => void;
}

export default function OrdersPageContainer({ orders, isLoading, onRetry, onSortChange }: OrdersPageContainerProps) {
    const formattedCount = isLoading ? "--" : orders.length;
    const [sortBy, setSortBy] = useState("recent");
    const router = useRouter();
    const { addItem } = useCartStore();
    const { user, isAuthenticated, loginWithKeycloak } = useAuthStore();
    const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);

    const handleSortChange = (value: string) => {
        setSortBy(value);
        if (onSortChange) {
            onSortChange(value);
        }
    };

    // Handle reorder - add all items from order to cart
    const handleReorder = useCallback(
        async (order: OrdersPageOrder) => {
            if (reorderingOrderId === order.id) return; // Prevent double clicks

            // Check authentication
            const hasToken =
                typeof window !== "undefined" &&
                (localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"));

            if (!user && !isAuthenticated && !hasToken) {
                toast.error("Please sign in to reorder.");
                void loginWithKeycloak({
                    redirectPath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/orders",
                });
                return;
            }

            if (!order.items || order.items.length === 0) {
                toast.error("No items to reorder.");
                return;
            }

            const firstItem = order.items[0];
            if (!firstItem.restaurantId) {
                toast.error("Restaurant information not found.");
                return;
            }

            setReorderingOrderId(order.id);
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

                        // Get image from item - check imageURL, cartItemImage, and productId encoded options
                        // Priority: imageURL > cartItemImage > productId encoded options > placeholder
                        const itemWithImage = item as OrderListItem & { cartItemImage?: string | null };
                        
                        // Try to get image from either field
                        let imageSource: string | null = null;
                        
                        // 1. Check imageURL first
                        if (itemWithImage.imageURL && typeof itemWithImage.imageURL === "string" && itemWithImage.imageURL.trim() !== "") {
                            imageSource = itemWithImage.imageURL.trim();
                        } 
                        // 2. Check cartItemImage
                        else if (itemWithImage.cartItemImage && typeof itemWithImage.cartItemImage === "string" && itemWithImage.cartItemImage.trim() !== "") {
                            imageSource = itemWithImage.cartItemImage.trim();
                        }
                        // 3. Try to extract imageURL from productId encoded options
                        else {
                            const imageFromProductId = parsedOptions?.imageURL || null;
                            if (imageFromProductId && imageFromProductId.trim() !== "") {
                                imageSource = imageFromProductId.trim();
                            }
                        }
                        
                        // Process image URL - getImageUrl handles both relative and absolute URLs
                        // If imageSource is null or empty, use placeholder
                        const imageUrl = imageSource ? getImageUrl(imageSource) : "/placeholder.png";
                        
                        // Debug log to help troubleshoot
                        console.log(`[Reorder] Adding item ${item.productName}:`, {
                            productId: item.productId,
                            imageURL: itemWithImage.imageURL,
                            cartItemImage: itemWithImage.cartItemImage,
                            imageSource,
                            finalImageUrl: imageUrl,
                        });

                        await addItem(
                            {
                                id: item.productId,
                                name: item.productName,
                                price: item.price,
                                image: imageUrl, // Pass the processed image URL
                                restaurantId: item.restaurantId || firstItem.restaurantId,
                                restaurantName: item.restaurantName,
                                sizeId: resolvedSizeId,
                                sizeName: resolvedSizeName,
                                customizations: resolvedCustomizations,
                            },
                            item.quantity,
                        );
                        successCount += 1;
                    } catch (itemError) {
                        console.error(`Failed to add item ${item.productName}:`, itemError);
                        // Continue with other items even if one fails
                    }
                }

                if (successCount === 0) {
                    toast.error("Không thể reorder vì các món cũ thiếu size hợp lệ.");
                    return;
                }

                // Wait a bit for cart to sync with backend
                await new Promise((resolve) => setTimeout(resolve, 500));

                if (skippedMissingSize > 0) {
                    toast.success(`Đã thêm ${successCount} món. Bỏ qua ${skippedMissingSize} món thiếu size.`);
                } else {
                    toast.success(`Added ${successCount} item(s) to your cart.`);
                }

                // Navigate to checkout page
                router.push(`/payment?restaurantId=${firstItem.restaurantId}`);
            } catch (error) {
                console.error("Failed to add items to cart:", error);
                toast.error("Failed to add to cart.");
            } finally {
                setReorderingOrderId(null);
            }
        },
        [reorderingOrderId, user, isAuthenticated, addItem, router, loginWithKeycloak],
    );

    return (
        <div className="custom-container py-8 sm:py-10 md:py-12">
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4 lg:gap-8">
                {/* Left Sidebar: User Menu */}
                <div className="lg:col-span-1">
                    <OrderHistorySidebar />
                </div>

                {/* Right Content: Order List */}
                <div className="lg:col-span-3">
                    {/* Filter options */}
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                                Your Orders ({formattedCount} orders)
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">Track deliveries, view details, or reorder in one click.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="cursor-pointer rounded-full border border-gray-300 bg-white px-3 py-2 font-semibold shadow-sm transition-colors hover:border-gray-400 focus:border-brand-orange/60 focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                title="Sort by"
                            >
                                <option value="recent">Recent</option>
                                <option value="oldest">Oldest First</option>
                                <option value="amount-high">Amount: High to Low</option>
                                <option value="amount-low">Amount: Low to High</option>
                                <option value="status">By Status</option>
                            </select>
                        </div>
                    </div>
                    {/* Order list */}
                    <div className="space-y-8">
                        {isLoading && (
                            <div className="space-y-8">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <OrderSkeleton key={`order-skeleton-${index}`} />
                                ))}
                            </div>
                        )}

                        {!isLoading && orders.length === 0 && (
                            <div className="overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                    {/* Icon */}
                                    <div className="mb-6 p-6 bg-gray-100 rounded-full">
                                        <Package className="w-16 h-16 text-gray-400" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h3>

                                    {/* Description */}
                                    <p className="text-gray-600 mb-8 max-w-md">
                                        You have not placed any orders yet. Browse restaurants and discover great food
                                        to get started.
                                    </p>

                                    {/* CTA Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Link
                                            href="/?type=foods"
                                            className="rounded-full bg-brand-orange px-6 py-3 font-bold text-white shadow-sm transition-all duration-200 hover:bg-brand-orange/90 hover:shadow-md"
                                        >
                                            Browse Food
                                        </Link>
                                        {onRetry && (
                                            <button
                                                onClick={onRetry}
                                                className="rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50"
                                            >
                                                Retry
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isLoading &&
                            orders.map((order) => {
                                const orderDate = new Date(order.createdAt);
                                const formattedDate = isNaN(orderDate.getTime())
                                    ? order.createdAt
                                    : orderDate.toLocaleDateString("en-US");

                                // Get status display info - Orange for processing, Green for completed, Red for cancelled
                                const getStatusInfo = (status?: OrderStatus) => {
                                    switch (status) {
                                        case OrderStatus.PENDING:
                                        case OrderStatus.CONFIRMED:
                                        case OrderStatus.PREPARING:
                                        case OrderStatus.READY:
                                        case OrderStatus.DELIVERING:
                                            return {
                                                text:
                                                    status === OrderStatus.PENDING
                                                        ? "Processing"
                                                        : status === OrderStatus.CONFIRMED
                                                          ? "Processing"
                                                          : status === OrderStatus.PREPARING
                                                            ? "Processing"
                                                            : "Processing",
                                                className: "text-[#EE4D2D]",
                                            };
                                        case OrderStatus.COMPLETED:
                                            return {
                                                text: "Completed",
                                                className: "text-green-600",
                                            };
                                        case OrderStatus.CANCELLED:
                                            return {
                                                text: "Cancelled",
                                                className: "text-red-600",
                                            };
                                        default:
                                            return {
                                                text: "Unknown",
                                                className: "text-gray-600",
                                            };
                                    }
                                };

                                const statusInfo = getStatusInfo(order.status);

                                const firstItem = order.items[0];
                                const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

                                // Normalize image URL using helper (handles absolute/relative URLs and placeholders)
                                const cardImageUrl = firstItem?.imageURL ? getImageUrl(firstItem.imageURL) : null;
                                const hasImage = cardImageUrl && cardImageUrl !== "/placeholder.png";

                                return (
                                    <div
                                        key={order.id}
                                        className="overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.10)]"
                                    >
                                        {/* Header Card */}
                                        <div className="border-b border-gray-200 bg-white px-5 py-4">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="flex-1">
                                                    <h2 className="text-lg font-bold tracking-tight text-gray-900 mb-1">
                                                        {firstItem?.restaurantName || "Restaurant"}
                                                    </h2>
                                                    <p className="text-sm text-gray-500">{formattedDate}</p>
                                                </div>
                                                {order.status && (
                                                    <span className={`text-sm font-semibold ${statusInfo.className}`}>
                                                        {statusInfo.text}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Track Order Button - Below Status */}
                                            {order.status && order.status !== OrderStatus.CANCELLED && (
                                                <div className="mt-3">
                                                    <Link
                                                        href={`/delivery/${order.slug || order.id}`}
                                                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-100"
                                                    >
                                                        <Truck className="w-4 h-4" />
                                                        Track Order
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        {/* Body Card */}
                                        <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                {hasImage && cardImageUrl ? (
                                                    <div className="relative h-16 w-16 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-200 ring-1 ring-gray-200">
                                                        <Image
                                                            src={cardImageUrl}
                                                            alt={firstItem?.productName || "Order item"}
                                                            fill
                                                            className="object-cover"
                                                            sizes="64px"
                                                            unoptimized={cardImageUrl.startsWith("http")}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-white ring-1 ring-gray-200 flex items-center justify-center text-gray-300">
                                                        <Package className="w-6 h-6" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">
                                                        {firstItem?.productName || "Item"}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Items: {totalItems}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Card */}
                                        <div className="flex items-center justify-between gap-4 bg-white px-5 py-4">
                                            <p className="text-xl font-bold text-brand-orange">
                                                {formatCurrency(order.totalAmount)}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/orders/${order.slug || order.id}`}
                                                    className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
                                                >
                                                    View Details
                                                </Link>
                                                <button
                                                    onClick={() => handleReorder(order)}
                                                    disabled={reorderingOrderId === order.id}
                                                    className="rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-orange/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {reorderingOrderId === order.id ? "Adding..." : "Reorder"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    );
}
