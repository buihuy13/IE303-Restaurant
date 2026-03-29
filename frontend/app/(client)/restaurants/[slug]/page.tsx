"use client";

import { Button } from "@/components/ui/Button";
import RestaurantActions from "@/components/client/Restaurant/RestaurantActions";
import RestaurantBreadcrumb from "@/components/client/Restaurant/RestaurantBreadcrumb";
import RestaurantHero from "@/components/client/Restaurant/RestaurantHero";
import RestaurantInfo from "@/components/client/Restaurant/RestaurantInfo";
import RestaurantMenuWrapper from "@/components/client/Restaurant/RestaurantMenuWrapper";
import RestaurantNavTabs from "@/components/client/Restaurant/RestaurantNavTabs";
import RestaurantReviews from "@/components/client/Restaurant/RestaurantReviews";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { productApi } from "@/lib/api/productApi";
import type { Product, Restaurant, Review } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type LoadState =
    | { status: "loading" }
    | { status: "error"; message: string; code?: number }
    | { status: "ready"; restaurant: Restaurant; products: Product[]; reviews: Review[] };

export default function RestaurantDetailPage() {
    const router = useRouter();
    const params = useParams<{ slug: string }>();
    const slug = useMemo(() => (typeof params?.slug === "string" ? params.slug : ""), [params]);

    const [state, setState] = useState<LoadState>({ status: "loading" });

    useEffect(() => {
        let cancelled = false;
        if (!slug) return;

        const run = async () => {
            setState({ status: "loading" });
            try {
                const restaurantResponse = await restaurantApi.getByRestaurantSlug(slug);
                const restaurant = restaurantResponse.data as Restaurant | null;

                if (!restaurant) {
                    if (!cancelled) setState({ status: "error", message: "Restaurant not found." });
                    return;
                }

                // GET /restaurant/{slug} doesn't include products in the response.
                // Fetch products separately for the menu section.
                const productsRes = await productApi.getProductsByRestaurantId(restaurant.id);
                const products = Array.isArray(productsRes.data) ? productsRes.data : [];

                const reviewsResponse = await restaurantApi.getAllReviews(restaurant.id);
                const reviews = Array.isArray(reviewsResponse.data) ? reviewsResponse.data : [];

                if (!cancelled) {
                    setState({ status: "ready", restaurant, products, reviews });
                }
            } catch (err: unknown) {
                const axiosErr = err as { response?: { status?: number }; message?: string };
                const code = axiosErr?.response?.status;

                if (!cancelled) {
                    setState({
                        status: "error",
                        code,
                        message: code === 401 ? "Please login to view this restaurant." : "We couldn’t load this restaurant right now. Please try again.",
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
            <main className="bg-gradient-to-b from-gray-50 via-gray-50 to-white pb-24">
                <div className="custom-container py-12 md:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-10 w-1/2 rounded-xl bg-white border border-gray-200 shadow-sm animate-pulse" />
                            <div className="h-40 w-full rounded-2xl bg-white border border-gray-200 shadow-sm animate-pulse" />
                            <div className="h-40 w-full rounded-2xl bg-white border border-gray-200 shadow-sm animate-pulse" />
                        </div>
                        <div className="lg:col-span-1 space-y-4">
                            <div className="h-24 w-full rounded-2xl bg-white border border-gray-200 shadow-sm animate-pulse" />
                            <div className="h-24 w-full rounded-2xl bg-white border border-gray-200 shadow-sm animate-pulse" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (state.status === "error") {
        return (
            <main className="bg-gradient-to-b from-gray-50 via-gray-50 to-white pb-24">
                <div className="custom-container py-12 md:py-20">
                    <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="text-lg font-bold tracking-tight text-gray-900">Can’t open this restaurant</div>
                        <div className="mt-2 text-sm text-gray-600">{state.message}</div>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {state.code === 401 && (
                                <Button type="button" variant="brand" className="rounded-full" onClick={() => router.push("/login")}>
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

    const { restaurant, products, reviews } = state;

    return (
        <main className="scroll-smooth bg-gradient-to-b from-gray-50 via-gray-50 to-white pb-24">
            <RestaurantHero restaurant={restaurant} />
            <RestaurantNavTabs />
            <div className="custom-container">
                <div className="rounded-3xl border border-gray-200/70 bg-white/70 backdrop-blur-sm shadow-sm px-4 py-3 sm:px-5 sm:py-4">
                    <RestaurantBreadcrumb restaurant={restaurant} />
                </div>
            </div>
            <div className="custom-container">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
                    {/* Left column: Menu, About, Reviews */}
                    <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                        <section id="menu" className="scroll-mt-20">
                            <RestaurantMenuWrapper
                                restaurantId={restaurant.id}
                                restaurantName={restaurant.resName}
                                restaurantSlug={restaurant.slug}
                                restaurantDuration={restaurant.duration}
                                products={products}
                                categories={restaurant.cate}
                            />
                        </section>

                        <section id="about" className="scroll-mt-20">
                            <RestaurantInfo
                                name={restaurant.resName}
                                about={"About restaurant"}
                                address={restaurant.address}
                                phone={restaurant.phone}
                                openingTime={restaurant.openingTime}
                                closingTime={restaurant.closingTime}
                            />
                        </section>

                        <section id="reviews" className="scroll-mt-20">
                            <RestaurantReviews reviews={reviews || []} />
                        </section>
                    </div>

                    {/* Right column: Chat with restaurant (sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 self-start">
                            <div className="rounded-3xl border border-gray-200/70 bg-white/80 backdrop-blur-sm shadow-sm p-4 sm:p-5">
                                <section id="actions" className="scroll-mt-20">
                                    <RestaurantActions restaurant={restaurant} />
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
