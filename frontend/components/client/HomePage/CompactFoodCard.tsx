"use client";

import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { Button } from "@/components/ui/Button";
import { QuickAddSizeDialog } from "@/components/client/Food/QuickAddSizeDialog";
import { useProductQuickAdd } from "@/hooks/client/useProductQuickAdd";
import { getImageUrl } from "@/lib/utils";
import {
    getProductCardPriceDisplay,
} from "@/lib/utils/productListDisplay";
import { getProductDetailHref } from "@/lib/utils/productNavigation";
import { getRestaurantCartMeta, getRestaurantDetailHref } from "@/lib/utils/restaurantNavigation";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Product } from "@/types";
import { Check, CheckCircle2, Clock, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

type CompactFoodCardProps = {
    product: Product;
    restaurant?: {
        id: string;
        resName?: string;
        slug?: string;
        duration?: number;
    };
};

export const CompactFoodCard = memo(({ product, restaurant: restaurantOverride }: CompactFoodCardProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { theme } = useClientTheme();
    const addItem = useCartStore((state) => state.addItem);
    const setUserId = useCartStore((state) => state.setUserId);
    const { user, loginWithKeycloak } = useAuthStore();
    const [justAdded, setJustAdded] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [imageError, setImageError] = useState(false);
    const justAddedTimerRef = useRef<number | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        return () => {
            if (justAddedTimerRef.current) {
                window.clearTimeout(justAddedTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isMounted && user?.id) {
            setUserId(user.id);
        }
    }, [isMounted, user?.id, setUserId]);

    // Get minPrice filter from URL if exists
    const minPriceFilter = useMemo(() => {
        const priceRange = searchParams?.get("priceRange");
        if (!priceRange) return null;
        
        const decodedPriceRange = decodeURIComponent(priceRange);
        if (decodedPriceRange.endsWith("+")) {
            const minPrice = parseFloat(decodedPriceRange.replace("+", ""));
            return !isNaN(minPrice) && minPrice > 0 ? minPrice : null;
        } else {
            const [min] = decodedPriceRange.split("-");
            const minPrice = min ? parseFloat(min) : null;
            return minPrice !== null && !isNaN(minPrice) && minPrice > 0 ? minPrice : null;
        }
    }, [searchParams]);

    const priceInfo = useMemo(() => getProductCardPriceDisplay(product, minPriceFilter), [product, minPriceFilter]);
    const cardImageUrl = useMemo(() => getImageUrl(product.imageURL), [product.imageURL]);

    useEffect(() => {
        setImageError(false);
    }, [cardImageUrl]);

    const restaurant = useMemo(() => {
        return restaurantOverride || product.restaurant;
    }, [restaurantOverride, product.restaurant]);

    const isOnRestaurantPage = pathname?.startsWith("/restaurants/");

    const productLink = useMemo(() => {
        const foodHref = getProductDetailHref(product);
        if (isOnRestaurantPage) {
            return foodHref ?? "/search?type=foods";
        }
        return getRestaurantDetailHref(restaurant) ?? foodHref ?? "/search?type=foods";
    }, [isOnRestaurantPage, product, restaurant]);

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
        minPriceFilter,
        addItem,
        onAdded: () => {
            setJustAdded(true);
            if (justAddedTimerRef.current) window.clearTimeout(justAddedTimerRef.current);
            justAddedTimerRef.current = window.setTimeout(() => setJustAdded(false), 900);
        },
        requireAuth,
    });

    // Check if favorite (high rating or many reviews)
    const isFavorite = useMemo(() => {
        return product.rating >= 4.5 || product.totalReview > 50;
    }, [product.rating, product.totalReview]);

    // Route ETA in minutes (from query-service ORS seconds → rounded-up minutes in `queryMappers`).
    const deliveryTime = useMemo(() => {
        const duration = restaurant?.duration;
        if (typeof duration !== "number" || !Number.isFinite(duration) || duration <= 0) {
            return null;
        }
        if (Number.isInteger(duration)) {
            return duration.toString();
        }
        return duration.toFixed(1).replace(/\.0$/, "");
    }, [restaurant?.duration]);

    // Format price to VND
    const formatPrice = priceInfo.label;

    // Format review count
    const formatReviewCount = useMemo(() => {
        if (!product.totalReview || product.totalReview === 0) return null;
        if (product.totalReview >= 1000) {
            return `${(product.totalReview / 1000).toFixed(1)}k+`;
        }
        return `${product.totalReview}+`;
    }, [product.totalReview]);

    const handleAddToCart = handleQuickAdd;

    const cardShellClass =
        theme === "dark"
            ? "bg-[#111427] rounded-3xl overflow-hidden border border-white/10 shadow-[0_18px_50px_rgba(2,6,20,0.5)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_60px_rgba(2,6,20,0.6)] focus-within:ring-2 focus-within:ring-[color:var(--ring)]"
            : "bg-white rounded-3xl overflow-hidden border border-gray-200/70 shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-orange/25 focus-within:ring-2 focus-within:ring-brand-orange/15";

    const titleClass = theme === "dark" ? "text-white/95 hover:text-white" : "text-gray-900 hover:text-brand-orange";
    const subTextClass = theme === "dark" ? "text-white/72" : "text-gray-600";
    const ratingTextClass = theme === "dark" ? "text-white/90" : "text-gray-800";
    const reviewCountClass = theme === "dark" ? "text-white/60" : "text-gray-500";
    const dividerClass = theme === "dark" ? "border-white/10" : "border-gray-100";

    return (
        <div className={`group relative border ${cardShellClass}`}>
            {/* Image Section */}
            <Link
                href={productLink}
                className="block relative w-full aspect-[3/2] overflow-hidden"
            >
                <div className={`relative w-full h-full overflow-hidden ${theme === "dark" ? "bg-[#1b2140]" : "bg-gradient-to-br from-gray-100 to-gray-200"}`}>
                    <Image
                        src={imageError ? "/placeholder.png" : cardImageUrl}
                        alt={product.productName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        unoptimized={!product.imageURL || cardImageUrl === "/placeholder.png" || imageError}
                        onError={() => {
                            if (!imageError) {
                                setImageError(true);
                            }
                        }}
                    />

                    {/* Premium overlay for dark mode */}
                    {theme === "dark" && (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                            <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_50%_18%,rgba(87,42,248,0.14),transparent_60%)]" />
                        </>
                    )}

                    {/* Placeholder overlay */}
                    {(!product.imageURL || cardImageUrl === "/placeholder.png") && (
                        <div
                            className={`absolute inset-0 flex items-center justify-center ${
                                theme === "dark"
                                    ? "bg-gradient-to-br from-white/10 to-white/5"
                                    : "bg-gradient-to-br from-orange-100 to-orange-200"
                            }`}
                        >
                            <span className="text-4xl">🍽️</span>
                        </div>
                    )}

                    {/* Favorite Badge - Top Left */}
                    {isFavorite && (
                        <div className="absolute top-2 left-2 z-20 pointer-events-none">
                            <span
                                className={`text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 ${
                                    theme === "dark" ? "bg-brand-orange/90 border border-brand-orange/60 backdrop-blur-md" : "bg-brand-orange"
                                }`}
                            >
                                ❤️ Favorite
                            </span>
                        </div>
                    )}

                    {/* Delivery Time Badge - Bottom Left */}
                    {deliveryTime && (
                        <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
                            <div
                                className={`text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 ${
                                    theme === "dark"
                                        ? "bg-black/50 border border-white/15 text-white/95 backdrop-blur-md"
                                        : "bg-white/90 backdrop-blur-md text-gray-900 ring-1 ring-black/5"
                                }`}
                            >
                                <Clock className="w-3 h-3" />
                                <span>{deliveryTime} phút</span>
                            </div>
                        </div>
                    )}
                </div>
            </Link>

            {/* Content Section */}
            <div className={`p-4 ${theme === "dark" ? "bg-[#0f172a]" : ""}`}>
                {/* Name + restaurant */}
                <div className="min-h-[52px]">
                    <Link href={productLink}>
                        <h3
                            className={`text-sm font-semibold line-clamp-2 leading-snug transition-colors ${titleClass}`}
                            title={product.productName}
                        >
                            {product.productName && product.productName.length > 0
                                ? product.productName.charAt(0).toUpperCase() + product.productName.slice(1)
                                : product.productName}
                        </h3>
                    </Link>
                    <div className="mt-1 flex items-center gap-1.5">
                        <p className={`text-xs line-clamp-1 flex-1 ${subTextClass}`}>{restaurant?.resName || "Restaurant"}</p>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" aria-label="Verified" />
                    </div>
                </div>

                {/* Price row */}
                <div className="mt-3 min-h-[32px]">
                    <div className="min-w-0">
                        {formatPrice ? (
                            <>
                                <p
                                    className={`whitespace-nowrap font-bold leading-tight ${
                                        priceInfo.hasMultipleSizes ? "text-[1.02rem]" : "text-base"
                                    } ${theme === "dark" ? "text-brand-orange" : "text-brand-orange"}`}
                                >
                                    {formatPrice}
                                </p>
                                {priceInfo.hint && (
                                    <p className={`text-[11px] mt-0.5 truncate ${theme === "dark" ? "text-white/50" : "text-gray-500"}`}>
                                        {priceInfo.hint}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className={`text-xs ${theme === "dark" ? "text-white/45" : "text-gray-400"}`}>Price not available</p>
                        )}
                    </div>
                </div>

                {/* Rating + CTA */}
                <div className={`mt-3 pt-3 border-t flex items-center justify-between gap-2.5 xl:gap-3 ${dividerClass}`}>
                    {product.rating > 0 ? (
                        <div className="flex min-w-0 items-center gap-1.5 text-xs">
                            <span className="text-yellow-500">⭐</span>
                            <span className={`font-semibold ${ratingTextClass}`}>{product.rating.toFixed(1)}</span>
                            {formatReviewCount && <span className={`${reviewCountClass} truncate`}>({formatReviewCount})</span>}
                        </div>
                    ) : (
                        <div className={`text-xs ${theme === "dark" ? "text-white/40" : "text-gray-400"}`}>No ratings yet</div>
                    )}

                    <Button
                        onClick={handleAddToCart}
                        disabled={isAdding || !isMounted}
                        variant="brandSoft"
                        size="sm"
                        className={`h-9 min-w-[108px] shrink-0 whitespace-nowrap rounded-full px-3 xl:min-w-[114px] shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                            theme === "dark"
                                ? "bg-brand-orange text-white border border-brand-orange/70 hover:bg-brand-orange/90 hover:text-white"
                                : "hover:bg-brand-orange hover:text-white focus-visible:bg-brand-orange focus-visible:text-white"
                        }`}
                        title={priceInfo.hasMultipleSizes ? "Choose size to add" : "Add to cart"}
                        aria-label={priceInfo.hasMultipleSizes ? "Choose size to add" : "Add to cart"}
                    >
                        {isAdding ? (
                            <div
                                className={`w-4 h-4 border-2 rounded-full animate-spin ${
                                    theme === "dark" ? "border-white border-t-transparent" : "border-white border-t-transparent"
                                }`}
                            />
                        ) : justAdded ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span className="ml-1.5 text-sm font-semibold">Added</span>
                            </>
                        ) : priceInfo.hasMultipleSizes ? (
                            <>
                                <Plus className="w-4 h-4" />
                                <span className="ml-1 text-[13px] font-semibold">Chọn size</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                <span className="ml-1.5 text-sm font-semibold">Add</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <QuickAddSizeDialog
                open={sizePickerOpen}
                onOpenChange={setSizePickerOpen}
                productName={product.productName}
                sizes={pickerSizes}
                isAdding={isAdding}
                onConfirm={handleConfirmSize}
            />
        </div>
    );
});

CompactFoodCard.displayName = "CompactFoodCard";
