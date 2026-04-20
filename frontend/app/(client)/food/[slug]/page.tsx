"use client";

import FoodDetail from "@/components/client/Food/FoodDetail";
import { Button } from "@/components/ui/Button";
import { productApi } from "@/lib/api/productApi";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Product, Restaurant } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ResCateDto = { cateId?: string; cateName?: string };
type RestaurantByProductDto = {
    id?: string;
    resName?: string;
    address?: string;
    longitude?: number;
    latitude?: number;
    rating?: number | null;
    openingTime?: string;
    closingTime?: string;
    phone?: string;
    imageURL?: string | null;
    merchantId?: string;
    enabled?: boolean;
    totalReview?: number;
    distance?: number | null;
    duration?: number | null;
    slug?: string;
    createdAt?: string;
    updatedAt?: string;
    cate?: ResCateDto[];
};

type LoadState =
    | { status: "loading" }
    | { status: "error"; message: string; code?: number }
    | { status: "ready"; foodItem: Product };

export default function FoodDetailPage() {
    const router = useRouter();
    const loginWithKeycloak = useAuthStore((state) => state.loginWithKeycloak);
    const params = useParams<{ slug: string }>();
    const slug = useMemo(() => (typeof params?.slug === "string" ? params.slug : ""), [params]);

    const [state, setState] = useState<LoadState>({ status: "loading" });

    useEffect(() => {
        let cancelled = false;
        if (!slug) return;

        const run = async () => {
            setState({ status: "loading" });
            try {
                const res = await productApi.getProductBySlug(slug);
                const foodItem = res.data as Product | null;
                if (!foodItem) {
                    setState({ status: "error", message: "Food item not found." });
                    return;
                }

                // Backend GET /products/{slug} doesn't include restaurant in the product response.
                // If `restaurant` is missing, fetch it separately.
                if (!foodItem.restaurant) {
                    const restaurantRes = await productApi.getRestaurantByProductId(foodItem.id);
                    const r = restaurantRes.data as RestaurantByProductDto | null;
                    if (!r || !r.id || !r.slug || !r.resName) {
                        setState({ status: "error", message: "Food item not found." });
                        return;
                    }

                    // Minimal mapping to match frontend `Restaurant` type.
                    const restaurant: Restaurant = {
                        id: r.id,
                        slug: r.slug,
                        resName: r.resName,
                        address: r.address ?? "",
                        longitude: r.longitude ?? 0,
                        latitude: r.latitude ?? 0,
                        rating: r.rating ?? 0,
                        openingTime: r.openingTime ?? "00:00:00",
                        closingTime: r.closingTime ?? "00:00:00",
                        phone: r.phone ?? "",
                        imageURL: r.imageURL ?? null,
                        merchantId: r.merchantId ?? "",
                        enabled: r.enabled ?? false,
                        totalReview: r.totalReview ?? 0,
                        distance: typeof r.distance === "number" ? r.distance : 0,
                        duration: typeof r.duration === "number" ? r.duration : 0,
                        cate: Array.isArray(r.cate)
                            ? r.cate
                                  .filter((c) => typeof c?.cateId === "string" && typeof c?.cateName === "string")
                                  .map((c) => ({ id: c.cateId!, cateName: c.cateName! }))
                            : [],
                        // Not returned by ResResponse; FoodDetail doesn't rely on it.
                        products: [],
                        createdAt: r.createdAt,
                        updatedAt: r.updatedAt,
                    };

                    foodItem.restaurant = restaurant;
                }

                if (!cancelled) setState({ status: "ready", foodItem });
            } catch (err: unknown) {
                const e = err as { response?: { status?: number } };
                const code = e?.response?.status;
                if (!cancelled) {
                    setState({
                        status: "error",
                        code,
                        message:
                            code === 401
                                ? "Please login to view this item."
                                : "We couldn’t load this item right now. Please try again.",
                    });
                }
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    if (state.status === "loading") {
        return (
            <main className="bg-gradient-to-b from-gray-50 via-gray-50 to-white">
                <div className="custom-container py-12 md:py-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
                        <div className="aspect-square rounded-2xl border border-gray-200 bg-white shadow-sm animate-pulse" />
                        <div className="space-y-4">
                            <div className="h-10 w-3/4 rounded-xl bg-white border border-gray-200 shadow-sm animate-pulse" />
                            <div className="h-8 w-40 rounded-xl bg-white border border-gray-200 shadow-sm animate-pulse" />
                            <div className="h-20 w-full rounded-2xl bg-white border border-gray-200 shadow-sm animate-pulse" />
                            <div className="h-12 w-full rounded-2xl bg-white border border-gray-200 shadow-sm animate-pulse" />
                            <div className="h-12 w-full rounded-2xl bg-white border border-gray-200 shadow-sm animate-pulse" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (state.status === "error") {
        return (
            <main className="bg-gradient-to-b from-gray-50 via-gray-50 to-white">
                <div className="custom-container py-12 md:py-20">
                    <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="text-lg font-bold tracking-tight text-gray-900">Can’t open this item</div>
                        <div className="mt-2 text-sm text-gray-600">{state.message}</div>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {state.code === 401 && (
                                <Button
                                    type="button"
                                    variant="brand"
                                    className="rounded-full"
                                    onClick={() =>
                                        void loginWithKeycloak({
                                            redirectPath:
                                                typeof window !== "undefined"
                                                    ? `${window.location.pathname}${window.location.search}`
                                                    : `/food/${slug}`,
                                        })
                                    }
                                >
                                    Login
                                </Button>
                            )}
                            <Button type="button" variant="secondary" className="rounded-full" onClick={() => router.back()}>
                                Go back
                            </Button>
                            <Button type="button" variant="brandOutline" className="rounded-full" onClick={() => router.push("/search")}>
                                Back to search
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-white">
            <div className="custom-container py-12 md:py-20">
                <FoodDetail foodItem={state.foodItem} restaurant={state.foodItem.restaurant!} />
            </div>
        </main>
    );
}
