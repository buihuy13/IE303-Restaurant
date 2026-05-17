"use client";

import { Button } from "@/components/ui/Button";
import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { productApi } from "@/lib/api/productApi";
import {
    fetchProductSizesForCart,
    getListPriceDisplay,
    hasListPriceRange,
    pickDefaultProductSize,
} from "@/lib/utils/productListDisplay";
import { Product } from "@/types";
import { Check, CheckCircle2, Clock, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";

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
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { theme } = useClientTheme();
    const addItem = useCartStore((state) => state.addItem);
    const setUserId = useCartStore((state) => state.setUserId);
    const { user, loginWithKeycloak } = useAuthStore();
    const [isAdding, setIsAdding] = useState(false);
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

    const displayPriceLabel = useMemo(() => {
        if (product.productSizes.length > 0) {
            const defaultFromSizes = pickDefaultProductSize(product.productSizes, minPriceFilter);
            if (defaultFromSizes) {
                return `${defaultFromSizes.price.toLocaleString("vi-VN")} ₫`;
            }
        }
        return getListPriceDisplay(product);
    }, [product, minPriceFilter]);
    const cardImageUrl = useMemo(() => getImageUrl(product.imageURL), [product.imageURL]);

    useEffect(() => {
        setImageError(false);
    }, [cardImageUrl]);

    const restaurant = useMemo(() => {
        return restaurantOverride || product.restaurant;
    }, [restaurantOverride, product.restaurant]);

    const restaurantSlug = useMemo(() => {
        const fromRestaurant = restaurant?.slug;
        if (typeof fromRestaurant === "string" && fromRestaurant.trim()) return fromRestaurant.trim();

        const fromProduct = (product as unknown as { restaurantSlug?: unknown }).restaurantSlug;
        if (typeof fromProduct === "string" && fromProduct.trim()) return fromProduct.trim();

        return "";
    }, [restaurant?.slug, product]);

    const restaurantId = useMemo(() => {
        const fromRestaurant = (restaurant as unknown as { id?: unknown })?.id;
        if (typeof fromRestaurant === "string" && fromRestaurant.trim()) return fromRestaurant.trim();

        const fromProduct = (product as unknown as { restaurantId?: unknown }).restaurantId;
        if (typeof fromProduct === "string" && fromProduct.trim()) return fromProduct.trim();

        return "";
    }, [restaurant, product]);

    const resolveRestaurantForCart = useCallback(async (): Promise<{ id: string; name: string } | null> => {
        const directId = restaurantId.trim();
        const directName = typeof restaurant?.resName === "string" ? restaurant.resName.trim() : "";
        if (directId) {
            return { id: directId, name: directName || "Unknown Restaurant" };
        }

        try {
            const response = await productApi.getRestaurantByProductId(product.id);
            const payload = response.data as {
                id?: unknown;
                resId?: unknown;
                restaurantId?: unknown;
                resName?: unknown;
                name?: unknown;
            } | null;

            if (!payload || typeof payload !== "object") {
                return null;
            }

            const fallbackIdRaw = payload.id ?? payload.resId ?? payload.restaurantId;
            const fallbackId =
                typeof fallbackIdRaw === "string"
                    ? fallbackIdRaw.trim()
                    : fallbackIdRaw != null &&
                        (typeof fallbackIdRaw === "number" || typeof fallbackIdRaw === "bigint")
                      ? String(fallbackIdRaw)
                      : "";

            if (!fallbackId) {
                return null;
            }

            const fallbackName =
                typeof payload.resName === "string"
                    ? payload.resName.trim()
                    : typeof payload.name === "string"
                      ? payload.name.trim()
                      : "";

            return { id: fallbackId, name: fallbackName || "Unknown Restaurant" };
        } catch {
            return null;
        }
    }, [restaurantId, restaurant?.resName, product.id]);

    const isOnRestaurantPage = pathname?.startsWith("/restaurants/");
    const isFoodSearchPage = pathname?.startsWith("/search") && searchParams?.get("type") === "foods";
    const restaurantTarget = restaurantSlug || restaurantId;
    const needsRestaurantLookup = !isOnRestaurantPage && isFoodSearchPage && !restaurantTarget;

    // Determine link based on current location
    // If already on restaurant page, link to food detail page
    // Otherwise, link to restaurant page
    const productLink = useMemo(() => {
        if (isOnRestaurantPage) {
            // On restaurant page, go to food detail
            return `/food/${product.slug}`;
        } else {
            // Outside restaurant page, go to restaurant page (search/home should land on restaurant detail)
            // If we don't have enough restaurant info in the product response,
            // we'll still fallback to /food/[slug], then we can optionally lookup restaurant on click.
            return restaurantTarget ? `/restaurants/${restaurantTarget}` : `/food/${product.slug}`;
        }
    }, [isOnRestaurantPage, product.slug, restaurantTarget]);

    const handleCardNavigate = useCallback(
        async (e: React.MouseEvent) => {
            if (!needsRestaurantLookup) return;
            e.preventDefault();
            e.stopPropagation();

            try {
                const res = await productApi.getRestaurantByProductId(product.id);
                const restaurant = res.data as { slug?: string } | null;
                if (restaurant?.slug) {
                    router.push(`/restaurants/${restaurant.slug}`);
                    return;
                }
            } catch {
                // ignore and fallback to food detail
            }

            router.push(`/food/${product.slug}`);
        },
        [needsRestaurantLookup, product.id, product.slug, router],
    );

    // Check if favorite (high rating or many reviews)
    const isFavorite = useMemo(() => {
        return product.rating >= 4.5 || product.totalReview > 50;
    }, [product.rating, product.totalReview]);

    // Delivery time
    const deliveryTime = useMemo(() => {
        const duration = restaurant?.duration;
        if (!duration || typeof duration !== "number") {
            return "20-30";
        }
        if (duration > 60 || duration <= 0) {
            return "20-30";
        }
        return Math.round(duration).toString();
    }, [restaurant?.duration]);

    // Format price to VND
    const formatPrice = displayPriceLabel;

    // Format review count
    const formatReviewCount = useMemo(() => {
        if (!product.totalReview || product.totalReview === 0) return null;
        if (product.totalReview >= 1000) {
            return `${(product.totalReview / 1000).toFixed(1)}k+`;
        }
        return `${product.totalReview}+`;
    }, [product.totalReview]);

    const handleAddToCart = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (isAdding || !isMounted) {
                return;
            }

            if (typeof addItem !== "function") {
                console.warn("[CompactFoodCard] addItem is not available yet");
                return;
            }

            if (!user) {
                toast.error("Please sign in to add items to cart");
                void loginWithKeycloak({
                    redirectPath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/",
                });
                return;
            }

            setIsAdding(true);
            try {
                let sizes = product.productSizes;
                if (sizes.length === 0) {
                    if (!hasListPriceRange(product)) {
                        toast.error("This product has no available sizes");
                        return;
                    }
                    sizes = await fetchProductSizesForCart(product.id);
                }
                const defaultSize = pickDefaultProductSize(sizes, minPriceFilter);
                if (!defaultSize) {
                    toast.error("This product has no available sizes");
                    return;
                }

                const restaurantForCart = await resolveRestaurantForCart();
                if (!restaurantForCart) {
                    toast.error("Restaurant information not found");
                    return;
                }

                await addItem(
                    {
                        id: product.id,
                        name: product.productName,
                        price: defaultSize.price,
                        image: cardImageUrl,
                        restaurantId: restaurantForCart.id,
                        restaurantName: restaurantForCart.name,
                        categoryId: product.categoryId,
                        categoryName: product.categoryName,
                        sizeId: defaultSize.id,
                        sizeName: defaultSize.sizeName,
                    },
                    1,
                );
                // Toast is handled by cartStore.addItem
                setJustAdded(true);
                if (justAddedTimerRef.current) window.clearTimeout(justAddedTimerRef.current);
                justAddedTimerRef.current = window.setTimeout(() => setJustAdded(false), 900);
            } catch (error) {
                console.error("Failed to add to cart:", error);
                // Error toast is handled by cartStore.addItem
            } finally {
                setTimeout(() => {
                    setIsAdding(false);
                }, 300);
            }
        },
        [isAdding, isMounted, user, product, minPriceFilter, cardImageUrl, addItem, resolveRestaurantForCart, loginWithKeycloak],
    );

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
                onClick={handleCardNavigate}
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
                                <span>{deliveryTime} min</span>
                            </div>
                        </div>
                    )}
                </div>
            </Link>

            {/* Content Section */}
            <div className={`p-4 ${theme === "dark" ? "bg-[#0f172a]" : ""}`}>
                {/* Name + restaurant */}
                <div className="min-h-[52px]">
                    <Link href={productLink} onClick={handleCardNavigate}>
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

                {/* Meta row */}
                <div className="mt-3 flex items-center justify-between gap-3 min-h-[20px]">
                    {product.rating > 0 ? (
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-yellow-500">⭐</span>
                            <span className={`font-semibold ${ratingTextClass}`}>{product.rating.toFixed(1)}</span>
                            {formatReviewCount && <span className={reviewCountClass}>({formatReviewCount})</span>}
                        </div>
                    ) : (
                        <div className={`text-xs ${theme === "dark" ? "text-white/40" : "text-gray-400"}`}>No ratings yet</div>
                    )}
                    <div className="text-xs text-gray-400 whitespace-nowrap" aria-hidden="true">
                        &nbsp;
                    </div>
                </div>

                {/* Price + CTA */}
                <div className={`mt-3 pt-3 border-t flex items-center justify-between gap-3 ${dividerClass}`}>
                    <div className="min-w-0">
                        {formatPrice ? (
                            <p className={`text-base font-bold ${theme === "dark" ? "text-brand-orange" : "text-brand-orange"}`}>{formatPrice}</p>
                        ) : (
                            <p className={`text-xs ${theme === "dark" ? "text-white/45" : "text-gray-400"}`}>Price not available</p>
                        )}
                    </div>

                    <Button
                        onClick={handleAddToCart}
                        disabled={isAdding || !isMounted}
                        variant="brandSoft"
                        size="sm"
                        className={`h-9 rounded-full px-3 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                            theme === "dark"
                                ? "bg-brand-orange text-white border border-brand-orange/70 hover:bg-brand-orange/90 hover:text-white"
                                : "hover:bg-brand-orange hover:text-white focus-visible:bg-brand-orange focus-visible:text-white"
                        }`}
                        title="Add to cart"
                        aria-label="Add to cart"
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
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                <span className="ml-1.5 text-sm font-semibold">Add</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
});

CompactFoodCard.displayName = "CompactFoodCard";
