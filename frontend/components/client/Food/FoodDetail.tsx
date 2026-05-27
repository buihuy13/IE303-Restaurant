"use client";

// 1. Import ProductSize
import { productApi } from "@/lib/api/productApi";
import { getImageUrl } from "@/lib/utils";
import { getRestaurantDetailHref } from "@/lib/utils/restaurantNavigation";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ReviewStatsResponse } from "@/lib/api/reviewApi";
import { Product, ProductSize, Restaurant, Review } from "@/types";
import { Check, ChevronRight, Home, MessageSquare, Minus, Plus, Star, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type FoodDetailClientProps = {
    foodItem: Product;
    restaurant: Restaurant;
    reviewStats?: ReviewStatsResponse | null;
    reviews?: Review[];
};

export default function FoodDetail({ foodItem, restaurant, reviewStats, reviews = [] }: FoodDetailClientProps) {
    const { addItem } = useCartStore();
    const { user, loginWithKeycloak } = useAuthStore();
    const [quantity, setQuantity] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);

    const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(foodItem.productSizes?.[0]);

    /** Avoid infinite load/error loops with `next/image` (do not mutate `img.src` in `onError`). */
    const primaryImageSrc = useMemo(
        () => getImageUrl(foodItem.imageURL, "/default-food-image.png"),
        [foodItem.imageURL],
    );
    type ImageLoadStage = "primary" | "local_placeholder" | "hidden";
    const [imageStage, setImageStage] = useState<ImageLoadStage>("primary");

    useEffect(() => {
        setImageStage("primary");
    }, [foodItem.id, primaryImageSrc]);

    const handleProductImageError = useCallback(() => {
        setImageStage((prev) => {
            if (prev === "primary") return "local_placeholder";
            if (prev === "local_placeholder") return "hidden";
            return prev;
        });
    }, []);

    const displayImageSrc =
        imageStage === "primary" ? primaryImageSrc : imageStage === "local_placeholder" ? "/placeholder.png" : null;

    const showImagePlaceholderOverlay =
        imageStage !== "primary" ||
        !foodItem.imageURL ||
        primaryImageSrc === "/default-food-image.png";

    // Ensure component is mounted (client-side only)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleDecrement = () => {
        setQuantity((prev) => Math.max(1, prev - 1));
    };

    const handleIncrement = () => {
        setQuantity((prev) => prev + 1);
    };

    const handleAddToCart = useCallback(async () => {
        // Prevent multiple clicks or if not mounted
        if (isAdding || !isMounted) {
            return;
        }

        // Ensure addItem is available (should always be, but double-check)
        if (typeof addItem !== "function") {
            console.warn("[FoodDetail] addItem is not available yet");
            return;
        }

        if (!user) {
            toast.error("Please login to add items to cart");
            void loginWithKeycloak({
                redirectPath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/",
            });
            return;
        }

        if (!selectedSize) {
            toast.error("Please select a size");
            return;
        }

        setIsAdding(true);
        try {
            const directRestaurantId = typeof restaurant?.id === "string" ? restaurant.id.trim() : "";
            const directRestaurantName = typeof restaurant?.resName === "string" ? restaurant.resName.trim() : "";

            let resolvedRestaurantId = directRestaurantId;
            let resolvedRestaurantName = directRestaurantName || "Unknown Restaurant";

            if (!resolvedRestaurantId) {
                try {
                    const response = await productApi.getRestaurantByProductId(foodItem.id);
                    const payload = response.data as {
                        id?: unknown;
                        resId?: unknown;
                        restaurantId?: unknown;
                        resName?: unknown;
                        name?: unknown;
                    } | null;

                    if (payload && typeof payload === "object") {
                        const fallbackIdRaw = payload.id ?? payload.resId ?? payload.restaurantId;
                        resolvedRestaurantId =
                            typeof fallbackIdRaw === "string"
                                ? fallbackIdRaw.trim()
                                : fallbackIdRaw != null &&
                                    (typeof fallbackIdRaw === "number" || typeof fallbackIdRaw === "bigint")
                                  ? String(fallbackIdRaw)
                                  : "";

                        const fallbackName =
                            typeof payload.resName === "string"
                                ? payload.resName.trim()
                                : typeof payload.name === "string"
                                  ? payload.name.trim()
                                  : "";
                        if (fallbackName) {
                            resolvedRestaurantName = fallbackName;
                        }
                    }
                } catch {
                    // ignore and use final guard below
                }
            }

            if (!resolvedRestaurantId) {
                toast.error("Restaurant information not found");
                return;
            }
            console.log(quantity, "quantity");
            await addItem(
                {
                    id: foodItem.id,
                    name: foodItem.productName,
                    price: selectedSize.price,
                    image: getImageUrl(foodItem.imageURL),
                    restaurantId: resolvedRestaurantId,
                    restaurantName: resolvedRestaurantName,
                    categoryId: foodItem.categoryId,
                    categoryName: foodItem.categoryName,
                    sizeId: selectedSize.id,
                    sizeName: selectedSize.sizeName,
                    customizations: specialInstructions || undefined,
                },
                quantity
            );

            // Reset form
            setQuantity(1);
            setSpecialInstructions("");
        } catch (error) {
            console.error("Failed to add to cart:", error);
            // Error toast is handled by cartStore.addItem
        } finally {
            setTimeout(() => {
                setIsAdding(false);
            }, 300);
        }
    }, [isAdding, isMounted, addItem, user, selectedSize, foodItem, restaurant, quantity, specialInstructions, loginWithKeycloak]);

    const currentPrice = selectedSize?.price ?? 0;
    const totalPrice = currentPrice * quantity;
    
    // Format price to VND
    const formatPrice = (price: number) => {
        return `${Math.round(price).toLocaleString("vi-VN")} ₫`;
    };
    const restaurantHref = getRestaurantDetailHref(restaurant) ?? "/search?type=restaurants";
    const displayRating =
        reviewStats?.averageRating != null && Number.isFinite(reviewStats.averageRating)
            ? reviewStats.averageRating
            : foodItem.rating;
    const displayReviewCount =
        reviewStats?.totalReviews != null && reviewStats.totalReviews >= 0
            ? reviewStats.totalReviews
            : foodItem.totalReview ?? 0;
    const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

    return (
        <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 mb-8 text-sm">
                <Link
                    href="/"
                    className="flex items-center gap-1 text-gray-600 hover:text-[#EE4D2D] transition-colors"
                >
                    <Home className="w-4 h-4" />
                    <span className="font-medium">Home</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link
                    href="/search?type=restaurants"
                    className="text-gray-600 hover:text-[#EE4D2D] transition-colors font-medium"
                >
                    Restaurants
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link
                    href={restaurantHref}
                    className="inline-flex items-center gap-1 rounded-full border border-[#EE4D2D]/30 bg-[#EE4D2D]/10 px-3 py-1 text-[#EE4D2D] transition-colors hover:bg-[#EE4D2D] hover:text-white font-semibold"
                >
                    <Store className="h-3.5 w-3.5" />
                    {restaurant.resName}
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800 font-semibold truncate max-w-[300px]">{foodItem.productName}</span>
            </nav>

            <Link
                href={restaurantHref}
                className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[#EE4D2D]/25 bg-[#EE4D2D]/5 px-4 py-2 text-sm font-semibold text-[#EE4D2D] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#EE4D2D]/10 hover:shadow"
            >
                <Store className="h-4 w-4" />
                Xem nha hang: {restaurant.resName}
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 p-4 lg:p-0">
                {/* Image Section - ShopeeFood Style */}
                <div className="relative">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-md">
                        {displayImageSrc ? (
                            <Image
                                src={displayImageSrc}
                                alt={foodItem.productName}
                                fill
                                className="w-full h-full object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                unoptimized={
                                    imageStage !== "primary" ||
                                    !foodItem.imageURL ||
                                    primaryImageSrc === "/default-food-image.png" ||
                                    displayImageSrc.startsWith("/")
                                }
                                onError={handleProductImageError}
                            />
                        ) : null}
                        {showImagePlaceholderOverlay && (
                            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                                <div className="text-center">
                                    <span className="text-6xl mb-3 block">🍽️</span>
                                    <span className="text-sm text-gray-600 font-medium">Preparing...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col space-y-6">
                    {/* Product Name - Bold and prominent */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            {foodItem.productName || "Special Beef Pho (Pho Dac Biet)"}
                        </h1>
                        {(displayReviewCount > 0 || displayRating > 0) && (
                            <div className="mb-4 flex items-center gap-2 text-sm text-gray-700">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{Number(displayRating).toFixed(1)}</span>
                                <span className="text-gray-500">
                                    ({displayReviewCount.toLocaleString()} reviews)
                                </span>
                            </div>
                        )}
                        {/* Price - Prominent in VND */}
                        {selectedSize ? (
                            <p className="text-3xl md:text-4xl font-bold text-[#EE4D2D]">
                                {formatPrice(selectedSize.price)}
                            </p>
                        ) : (
                            <p className="text-lg font-semibold text-[#EE4D2D]">Please select a size</p>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-base leading-relaxed">
                        {foodItem.description || "Traditional Vietnamese noodle soup with rare beef, brisket, and meatballs."}
                    </p>

                    <div className="mt-auto space-y-6">
                        {/* Size Selection - Radio List Style */}
                        {foodItem.productSizes && foodItem.productSizes.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 text-lg">Size Selection</h3>
                                <div className="space-y-3">
                                    {foodItem.productSizes.map((size, index) => {
                                        const isSelected = selectedSize?.id === size.id;
                                        const previousPrice = index > 0 ? foodItem.productSizes![index - 1].price : 0;
                                        const priceDiff = size.price - previousPrice;
                                        
                                        return (
                                            <label
                                                key={size.id}
                                                className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                                    isSelected
                                                        ? "border-[#EE4D2D] bg-[#EE4D2D]/5"
                                                        : "border-gray-300 hover:border-[#EE4D2D]/50 hover:bg-gray-50"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="size"
                                                    value={size.id}
                                                    checked={isSelected}
                                                    onChange={() => setSelectedSize(size)}
                                                    className="w-5 h-5 text-[#EE4D2D] focus:ring-[#EE4D2D] focus:ring-2"
                                                />
                                                <div className="flex-1 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900">{size.sizeName}</span>
                                                        {isSelected && (
                                                            <Check className="w-5 h-5 text-[#EE4D2D]" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-[#EE4D2D]">
                                                            {formatPrice(size.price)}
                                                        </span>
                                                        {index > 0 && priceDiff > 0 && (
                                                            <span className="text-sm text-gray-500">
                                                                (+{formatPrice(priceDiff)})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Special Instructions */}
                        <div>
                            <label
                                htmlFor="special-instructions"
                                className="block font-bold text-gray-900 mb-2 text-lg"
                            >
                                Special Instructions (Optional)
                            </label>
                            <textarea
                                id="special-instructions"
                                rows={3}
                                placeholder="E.g., No spicy, extra lime..."
                                value={specialInstructions}
                                onChange={(e) => setSpecialInstructions(e.target.value)}
                                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EE4D2D]/20 focus:border-[#EE4D2D] transition-all duration-200 resize-none"
                            ></textarea>
                        </div>

                        {/* Quantity and Add to Cart - Flexbox Layout */}
                        <div className="flex items-center gap-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-white flex-shrink-0">
                                <button
                                    title="Decrease quantity"
                                    onClick={handleDecrement}
                                    className="p-3 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <span className="px-6 py-3 text-lg font-bold text-gray-900 min-w-[4rem] text-center border-x border-gray-200">
                                    {quantity}
                                </span>
                                <button
                                    title="Increase quantity"
                                    onClick={handleIncrement}
                                    className="p-3 text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Add to Cart Button - Takes remaining width */}
                            {isMounted && (
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-[#EE4D2D] text-white font-bold py-4 px-8 rounded-lg hover:bg-[#EE4D2D]/90 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                                    disabled={!selectedSize || isAdding || !isMounted}
                                >
                                    {isAdding ? "Adding..." : `Add to Cart • ${formatPrice(totalPrice)}`}
                                </button>
                            )}
                            {!isMounted && (
                                <div className="flex-1 bg-gray-400 text-white font-bold py-4 px-8 rounded-lg text-center">
                                    Loading...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900">
                    <MessageSquare className="h-5 w-5 text-brand-orange" />
                    Product Reviews
                </h2>

                {reviews.length === 0 ? (
                    <div className="rounded-xl border border-gray-200/80 bg-gray-50 px-4 py-8 text-center">
                        <p className="text-sm font-medium text-gray-700">No detailed reviews yet</p>
                        <p className="mt-1 text-xs text-gray-500">This item already shows rating summary above.</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {visibleReviews.map((review) => (
                                <article key={review.id} className="rounded-xl border border-gray-200/80 bg-white p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="truncate text-sm font-semibold text-gray-900">{review.title || "Customer review"}</p>
                                        <div className="flex items-center gap-1 text-sm font-semibold text-yellow-600">
                                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                            <span>{Number(review.rating || 0).toFixed(1)}</span>
                                        </div>
                                    </div>
                                    {review.content && (
                                        <p className="mt-2 text-sm leading-relaxed text-gray-600">{review.content}</p>
                                    )}
                                </article>
                            ))}
                        </div>

                        {reviews.length > 3 && (
                            <button
                                type="button"
                                onClick={() => setShowAllReviews((v) => !v)}
                                className="mt-4 w-full rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-orange/50 hover:text-brand-orange"
                            >
                                {showAllReviews ? "Thu gọn" : `Xem thêm ${reviews.length - 3} review`}
                            </button>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
