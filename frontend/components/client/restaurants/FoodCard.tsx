"use client";

import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { Button } from "@/components/ui/Button";
import {
    getProductCardPriceDisplay,
} from "@/lib/utils/productListDisplay";
import { getProductDetailHref } from "@/lib/utils/productNavigation";
import { getRestaurantCartMeta, getRestaurantDetailHref } from "@/lib/utils/restaurantNavigation";
import { QuickAddSizeDialog } from "@/components/client/Food/QuickAddSizeDialog";
import { useProductQuickAdd } from "@/hooks/client/useProductQuickAdd";
import { Product } from "@/types";
import { CheckCircle2, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type FoodCardProps = {
    product: Product;
    layout?: "grid" | "flex"; // Option 1: grid (ShopeeFood), Option 2: flex (horizontal)
    restaurant?: {
        id: string;
        resName?: string;
        slug?: string;
        duration?: number;
    };
};

export const FoodCard = memo(({ product, layout = "grid", restaurant: restaurantOverride }: FoodCardProps) => {
    const pathname = usePathname();
    const { theme } = useClientTheme();
    const addItem = useCartStore((state) => state.addItem);
    const setUserId = useCartStore((state) => state.setUserId);
    const { user, loginWithKeycloak } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Ensure component is mounted (client-side only)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Ensure userId is set in cart store when user is available
    useEffect(() => {
        if (isMounted && user?.id) {
            setUserId(user.id);
        }
    }, [isMounted, user?.id, setUserId]);

    const priceInfo = useMemo(() => getProductCardPriceDisplay(product), [product]);
    const cardImageUrl = useMemo(() => getImageUrl(product.imageURL), [product.imageURL]);

    const formattedPrice = priceInfo.label;

    const reviewCountText = useMemo(() => {
        const count = typeof product.totalReview === "number" ? product.totalReview : 0;
        if (!count) return null;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}k+`;
        return `${count}+`;
    }, [product.totalReview]);

    // Reset image error when image URL changes
    useEffect(() => {
        setImageError(false);
    }, [cardImageUrl]);

    const restaurant = useMemo(() => {
        return restaurantOverride || product.restaurant;
    }, [restaurantOverride, product.restaurant]);

    const restaurantForCart = useMemo(() => getRestaurantCartMeta(restaurant), [restaurant]);

    const requireAuth = useCallback(() => {
        if (user) return true;
        toast.error("Please sign in to add items to cart");
        void loginWithKeycloak({
            redirectPath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/",
        });
        return false;
    }, [user, loginWithKeycloak]);

    const {
        isAdding,
        sizePickerOpen,
        setSizePickerOpen,
        pickerSizes,
        handleQuickAdd,
        handleConfirmSize,
    } = useProductQuickAdd({
        product,
        cardImageUrl,
        restaurantForCart,
        addItem,
        requireAuth,
    });

    const handleAddToCart = handleQuickAdd;

    const productLink = useMemo(() => {
        const isOnRestaurantPage = pathname?.startsWith("/restaurants/");
        const foodHref = getProductDetailHref(product);
        if (isOnRestaurantPage) {
            return foodHref ?? "/search?type=foods";
        }
        return getRestaurantDetailHref(restaurant) ?? foodHref ?? "/search?type=foods";
    }, [pathname, product, restaurant]);

    // Determine if product is best seller or popular (you can adjust logic based on your data)
    const isBestSeller = useMemo(() => {
        return product.totalReview > 50 || product.rating >= 4.5;
    }, [product.totalReview, product.rating]);

    const isPopular = useMemo(() => {
        return product.totalReview > 20 && product.rating >= 4.0;
    }, [product.totalReview, product.rating]);

    // Validate and format delivery time
    const deliveryTime = useMemo(() => {
        const duration = restaurant?.duration;
        if (!duration || typeof duration !== "number") {
            return null;
        }
        // If duration is unreasonable (> 60 minutes), show default range
        if (duration > 60 || duration <= 0) {
            return "20-30"; // Default reasonable range
        }
        return Math.round(duration).toString();
    }, [restaurant?.duration]);

    const addToCartButton = (compact?: boolean) => (
        <Button
            onClick={handleAddToCart}
            disabled={isAdding || !isMounted}
            variant="brandSoft"
            size="sm"
            className={`h-9 shrink-0 whitespace-nowrap rounded-full px-3 shadow-sm hover:shadow-md active:scale-95 ${
                compact ? "min-w-[102px] xl:min-w-[108px]" : "min-w-[108px] xl:min-w-[114px]"
            } ${
                theme === "dark"
                    ? "bg-brand-orange text-white border border-brand-orange/70 hover:bg-brand-orange/90"
                    : "hover:bg-brand-orange hover:text-white focus-visible:bg-brand-orange focus-visible:text-white"
            }`}
            title={priceInfo.hasMultipleSizes ? "Choose size to add" : "Add to Cart"}
            aria-label={priceInfo.hasMultipleSizes ? "Choose size to add" : "Add to Cart"}
        >
            {isAdding ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : priceInfo.hasMultipleSizes ? (
                <>
                    <Plus className="w-4 h-4" />
                    <span className={`${compact ? "ml-1" : "ml-1.5"} text-[13px] font-semibold`}>Chọn size</span>
                </>
            ) : (
                <>
                    <Plus className="w-4 h-4" />
                    <span className="ml-1.5 text-sm font-semibold">Add</span>
                </>
            )}
        </Button>
    );

    const priceBlock = (
        <div className={`min-w-0 flex-1 ${layout === "grid" ? "xl:max-w-[52%]" : "sm:max-w-[58%]"}`}>
            {formattedPrice ? (
                <>
                    <p
                        className={`whitespace-nowrap font-bold text-brand-orange ${
                            layout === "flex"
                                ? priceInfo.hasMultipleSizes
                                    ? "text-base sm:text-lg leading-tight"
                                    : "text-lg sm:text-xl leading-none"
                                : priceInfo.hasMultipleSizes
                                    ? "text-[1.02rem] leading-tight"
                                    : "text-base"
                        }`}
                    >
                        {formattedPrice}
                    </p>
                    {priceInfo.hint && (
                        <p className={`text-[11px] mt-0.5 truncate ${theme === "dark" ? "text-white/50" : "text-gray-500"}`}>
                            {priceInfo.hint}
                        </p>
                    )}
                </>
            ) : (
                <p className={`text-xs ${theme === "dark" ? "text-white/45" : "text-gray-400"}`}>No price</p>
            )}
        </div>
    );

    const ratingBlock = product.rating > 0 ? (
        <div className="flex min-w-0 items-center gap-1.5 text-xs">
            <span className="text-yellow-500">⭐</span>
            <span className={`font-semibold ${theme === "dark" ? "text-white/88" : "text-gray-700"}`}>
                {product.rating.toFixed(1)}
            </span>
            {reviewCountText && (
                <span className={`truncate ${theme === "dark" ? "text-white/58" : "text-gray-500"}`}>• {reviewCountText} reviews</span>
            )}
        </div>
    ) : (
        <span className={`text-xs ${theme === "dark" ? "text-white/45" : "text-gray-400"}`}>No ratings yet</span>
    );

    const sizePicker = (
        <QuickAddSizeDialog
            open={sizePickerOpen}
            onOpenChange={setSizePickerOpen}
            productName={product.productName}
            sizes={pickerSizes}
            isAdding={isAdding}
            onConfirm={handleConfirmSize}
        />
    );

    // Option 1: Grid Layout (ShopeeFood style) - RECOMMENDED
    if (layout === "grid") {
        const cardClass =
            theme === "dark"
                ? "bg-[#111427] border-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(3,6,20,0.55)]"
                : "bg-white border-gray-200 hover:border-brand-orange/20 hover:-translate-y-0.5 hover:shadow-md";

        return (
            <div
                className={`group relative rounded-3xl overflow-hidden border shadow-sm transition-[transform,shadow,border-color] duration-300 h-full flex flex-col max-w-[280px] mx-auto ${cardClass}`}
            >
                {/* Image Section - Rounded top corners */}
                <Link
                    href={productLink}
                    className="block relative"
                >
                    <div
                        className={`relative w-full aspect-[3/2] overflow-hidden rounded-t-3xl ${
                            theme === "dark" ? "bg-[#1b2140]" : "bg-gray-100"
                        }`}
                    >
                        <Image
                            src={imageError ? "/placeholder.png" : cardImageUrl}
                            alt={product.productName}
                            fill
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500 ease-out"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized={!product.imageURL || cardImageUrl === "/placeholder.png" || imageError}
                            onError={() => {
                                // Only set error state once to prevent infinite loop
                                if (!imageError) {
                                    setImageError(true);
                                }
                            }}
                        />
                        {/* Placeholder overlay for broken images */}
                        {(!product.imageURL || cardImageUrl === "/placeholder.png") && (
                            <div
                                className={`absolute inset-0 flex items-center justify-center ${
                                    theme === "dark"
                                        ? "bg-gradient-to-br from-white/10 to-white/5"
                                        : "bg-gradient-to-br from-orange-100 to-orange-200"
                                }`}
                            >
                                <div className="text-center">
                                    <span className="text-4xl mb-2 block">🍽️</span>
                                    <span className={`text-xs font-medium ${theme === "dark" ? "text-white/70" : "text-gray-600"}`}>
                                        Preparing...
                                    </span>
                                </div>
                            </div>
                        )}

                        {theme === "dark" && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                                <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_20%,rgba(87,42,248,0.16),transparent_58%)]" />
                            </>
                        )}

                        {/* Best Seller/Popular Badges - Top Left */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-2 z-10">
                            {isBestSeller && (
                                <span
                                    className={`text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                                        theme === "dark"
                                            ? "bg-brand-orange/90 border border-brand-orange/60 backdrop-blur-md"
                                            : "bg-gradient-to-r from-orange-500 to-red-500 ring-1 ring-white/30"
                                    }`}
                                >
                                    🔥 Best Seller
                                </span>
                            )}
                            {!isBestSeller && isPopular && (
                                <span
                                    className={`text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                                        theme === "dark"
                                            ? "bg-white/12 border border-white/16 backdrop-blur-md"
                                            : "bg-gradient-to-r from-purple-500 to-pink-500 ring-1 ring-white/30"
                                    }`}
                                >
                                    ⚡ Bestseller
                                </span>
                            )}
                        </div>

                        {/* Rating & Time Badges - Bottom Left Overlay */}
                        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 z-10">
                            {product.rating > 0 && (
                                <div
                                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 ${
                                        theme === "dark"
                                            ? "bg-black/50 border border-white/15 text-white/95 backdrop-blur-md"
                                            : "bg-white/90 backdrop-blur-md text-gray-800 ring-1 ring-white/60"
                                    }`}
                                >
                                    <span className="text-yellow-500">⭐</span>
                                    <span>{product.rating.toFixed(1)}</span>
                                </div>
                            )}
                            {deliveryTime && (
                                <div
                                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 ${
                                        theme === "dark"
                                            ? "bg-black/50 border border-white/15 text-white/95 backdrop-blur-md"
                                            : "bg-white/90 backdrop-blur-md text-gray-800 ring-1 ring-white/60"
                                    }`}
                                >
                                    <span>🕒</span>
                                    <span>{deliveryTime} min</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Link>

                {/* Content Section */}
                <div className={`p-4 flex-grow flex flex-col ${theme === "dark" ? "bg-[#0f172a]" : ""}`}>
                    <Link
                        href={productLink}
                        className="flex-grow flex flex-col"
                    >
                        {/* Product Name - Bold and Larger */}
                        <h3
                            className={`font-semibold text-sm tracking-tight line-clamp-2 mb-2 leading-snug ${
                                theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                            title={product.productName}
                        >
                            {product.productName.charAt(0).toUpperCase() + product.productName.slice(1)}
                        </h3>

                        {/* Restaurant Name with Verified Icon */}
                        <div className="flex items-center gap-1.5 mb-1">
                            <p className={`text-sm line-clamp-1 flex-1 ${theme === "dark" ? "text-white/72" : "text-gray-500"}`}>
                                {restaurant?.resName || "Restaurant"}
                            </p>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        </div>

                        <div className="mt-2 mb-1">{priceBlock}</div>
                    </Link>

                    {/* Rating + CTA */}
                    <div className={`mt-3 pt-3 border-t flex items-end justify-between gap-2.5 xl:gap-3 ${theme === "dark" ? "border-white/10" : "border-gray-100"}`}>
                        {ratingBlock}
                        {addToCartButton()}
                    </div>
                </div>
                {sizePicker}
            </div>
        );
    }

    // Option 2: Flex Layout (Horizontal) - Optimized for list view
    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border transition-[transform,shadow,border-color] duration-300 flex h-full min-h-[180px] hover:-translate-y-0.5 ${
                theme === "dark"
                    ? "bg-[#111427] border-white/10 shadow-[0_10px_35px_rgba(2,6,20,0.42)] hover:border-white/20 hover:shadow-[0_18px_45px_rgba(2,6,20,0.5)]"
                    : "bg-white border-gray-200 shadow-sm hover:border-brand-orange/20 hover:shadow-md"
            }`}
        >
            <Link
                href={productLink}
                className="block relative flex-shrink-0 w-[42%] sm:w-[38%] min-w-[150px] max-w-[220px]"
            >
                <div
                    className={`relative h-full w-full overflow-hidden ${
                        theme === "dark" ? "bg-[#1b2140]" : "bg-gradient-to-br from-gray-100 to-gray-200"
                    }`}
                >
                    <Image
                        src={imageError ? "/placeholder.png" : cardImageUrl}
                        alt={product.productName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        sizes="(max-width: 768px) 45vw, 220px"
                        unoptimized={!product.imageURL || cardImageUrl === "/placeholder.png" || imageError}
                        onError={() => {
                            if (!imageError) {
                                setImageError(true);
                            }
                        }}
                    />
                    {(!product.imageURL || cardImageUrl === "/placeholder.png") && (
                        <div
                            className={`absolute inset-0 flex items-center justify-center ${
                                theme === "dark"
                                    ? "bg-gradient-to-br from-white/10 to-white/5"
                                    : "bg-gradient-to-br from-orange-100 to-orange-200"
                            }`}
                        >
                            <div className="text-center">
                                <span className="text-3xl block mb-1.5">🍽️</span>
                                <span className={`text-[11px] font-medium ${theme === "dark" ? "text-white/70" : "text-gray-600"}`}>
                                    Preparing...
                                </span>
                            </div>
                        </div>
                    )}

                    {theme === "dark" && (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/8 to-transparent" />
                            <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_55%_15%,rgba(87,42,248,0.16),transparent_60%)]" />
                        </>
                    )}

                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                        {isBestSeller && (
                            <span
                                className={`text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                                    theme === "dark"
                                        ? "bg-brand-orange/90 border border-brand-orange/60 backdrop-blur-md"
                                        : "bg-gradient-to-r from-orange-500 to-red-500 ring-1 ring-white/30"
                                }`}
                            >
                                🔥 Best Seller
                            </span>
                        )}
                        {!isBestSeller && isPopular && (
                            <span
                                className={`text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                                    theme === "dark"
                                        ? "bg-white/12 border border-white/16 backdrop-blur-md"
                                        : "bg-gradient-to-r from-purple-500 to-pink-500 ring-1 ring-white/30"
                                }`}
                            >
                                ⚡ Bestseller
                            </span>
                        )}
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 z-10">
                        {product.rating > 0 && (
                            <div
                                className={`text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 ${
                                    theme === "dark"
                                        ? "bg-black/50 border border-white/15 text-white/95 backdrop-blur-md"
                                        : "bg-white/90 backdrop-blur-md text-gray-800 ring-1 ring-white/60"
                                }`}
                            >
                                <span className="text-yellow-500">⭐</span>
                                <span>{product.rating.toFixed(1)}</span>
                            </div>
                        )}
                        {deliveryTime && (
                            <div
                                className={`text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 ${
                                    theme === "dark"
                                        ? "bg-black/50 border border-white/15 text-white/95 backdrop-blur-md"
                                        : "bg-white/90 backdrop-blur-md text-gray-800 ring-1 ring-white/60"
                                }`}
                            >
                                <span>🕒</span>
                                <span>{deliveryTime} min</span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            <div className={`flex-1 min-w-0 p-4 flex flex-col justify-between ${theme === "dark" ? "bg-[#0f172a]" : ""}`}>
                <Link href={productLink} className="flex-grow flex flex-col min-w-0">
                    {restaurant?.resName && (
                        <p className={`text-[10px] uppercase tracking-wide font-semibold mb-1.5 ${theme === "dark" ? "text-white/55" : "text-gray-400"}`}>
                            {restaurant.resName}
                        </p>
                    )}

                    <h3
                        className={`font-semibold text-base sm:text-lg line-clamp-2 leading-snug mb-1.5 ${
                            theme === "dark" ? "text-white/95" : "text-gray-900"
                        }`}
                        title={product.productName}
                    >
                        {product.productName.charAt(0).toUpperCase() + product.productName.slice(1)}
                    </h3>

                    <div className="flex items-center gap-1.5 mb-2">
                        <p className={`text-xs line-clamp-1 ${theme === "dark" ? "text-white/68" : "text-gray-600"}`}>
                            {restaurant?.resName || "Restaurant"}
                        </p>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    </div>

                    <div className="mt-2 mb-1">{priceBlock}</div>
                </Link>

                <div className={`mt-auto pt-3 border-t flex items-end justify-between gap-2 xl:gap-2.5 ${theme === "dark" ? "border-white/10" : "border-gray-100"}`}>
                    {ratingBlock}
                    {addToCartButton(true)}
                </div>
            </div>
            {sizePicker}
        </div>
    );
});

FoodCard.displayName = "FoodCard";
