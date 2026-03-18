"use client";

import FoodDetail from "@/components/client/Food/FoodDetail";
import { Button } from "@/components/ui/Button";
import { productApi } from "@/lib/api/productApi";
import type { Product } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type LoadState =
    | { status: "loading" }
    | { status: "error"; message: string; code?: number }
    | { status: "ready"; foodItem: Product };

export default function FoodDetailPage() {
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
                const res = await productApi.getProductBySlug(slug);
                const foodItem = res.data as Product | null;
                if (!foodItem || !foodItem.restaurant) {
                    setState({ status: "error", message: "Food item not found." });
                    return;
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

    return (
        <main className="bg-white">
            <div className="custom-container py-12 md:py-20">
                <FoodDetail foodItem={state.foodItem} restaurant={state.foodItem.restaurant!} />
            </div>
        </main>
    );
}
