"use client";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

function formatPriceRange(raw: string) {
    const decoded = decodeURIComponent(raw);
    if (decoded.endsWith("+")) {
        const min = decoded.replace("+", "");
        return `Price: ${Number(min).toLocaleString("vi-VN")}₫+`;
    }
    const [min, max] = decoded.split("-");
    if (min === "0" && max) return `Price: ≤ ${Number(max).toLocaleString("vi-VN")}₫`;
    if (min && max) return `Price: ${Number(min).toLocaleString("vi-VN")}–${Number(max).toLocaleString("vi-VN")}₫`;
    return `Price: ${decoded}`;
}

function formatSort(raw: string) {
    if (!raw || raw === "relevance") return null;
    if (raw === "distance") return "Sort: Nearest";
    if (raw === "popular") return "Sort: Top Sales";
    if (raw === "rating") return "Sort: Top Rated";
    return `Sort: ${raw}`;
}

export function ActiveFilterPills({ className }: { className?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchType = searchParams.get("type") || "foods";

    const pills = useMemo(() => {
        const out: Array<{ key: string; label: string; onRemove: () => void }> = [];

        const removeParam = (key: string) => {
            const current = new URLSearchParams(Array.from(searchParams.entries()));
            current.delete(key);
            router.push(`/search?${current.toString()}`, { scroll: false });
        };

        const q = searchParams.get("q") || searchParams.get("search");
        if (q) {
            out.push({
                key: `q:${q}`,
                label: `Search: ${q}`,
                onRemove: () => {
                    const current = new URLSearchParams(Array.from(searchParams.entries()));
                    current.delete("q");
                    current.delete("search");
                    router.push(`/search?${current.toString()}`, { scroll: false });
                },
            });
        }

        if (searchType === "foods") {
            const categories = searchParams.getAll("category");
            for (const c of categories) {
                out.push({
                    key: `category:${c}`,
                    label: `Category: ${c}`,
                    onRemove: () => {
                        const current = new URLSearchParams(Array.from(searchParams.entries()));
                        const remaining = current.getAll("category").filter((v) => v !== c);
                        current.delete("category");
                        for (const v of remaining) current.append("category", v);
                        router.push(`/search?${current.toString()}`, { scroll: false });
                    },
                });
            }

            const priceRange = searchParams.get("priceRange");
            if (priceRange) {
                out.push({
                    key: `priceRange:${priceRange}`,
                    label: formatPriceRange(priceRange),
                    onRemove: () => removeParam("priceRange"),
                });
            }
        }

        const nearby = searchParams.get("nearby");
        if (nearby) {
            out.push({
                key: `nearby:${nearby}`,
                label: `Within ${Number(nearby).toLocaleString("vi-VN")} m`,
                onRemove: () => removeParam("nearby"),
            });
        }

        const ratingMin = searchParams.get("ratingMin");
        if (ratingMin) {
            out.push({
                key: `ratingMin:${ratingMin}`,
                label: `Rating: ≥ ${ratingMin}`,
                onRemove: () => removeParam("ratingMin"),
            });
        }

        const deliveryMaxMinutes = searchParams.get("deliveryMaxMinutes");
        if (deliveryMaxMinutes) {
            out.push({
                key: `delivery:${deliveryMaxMinutes}`,
                label: `Delivery: < ${deliveryMaxMinutes} min`,
                onRemove: () => removeParam("deliveryMaxMinutes"),
            });
        }

        if (searchParams.get("openNow") === "1") {
            out.push({
                key: "openNow",
                label: "Open now",
                onRemove: () => removeParam("openNow"),
            });
        }

        if (searchParams.get("freeShip") === "1") {
            out.push({
                key: "freeShip",
                label: "Free ship",
                onRemove: () => removeParam("freeShip"),
            });
        }

        const sort = formatSort(searchParams.get("sort") || "");
        if (sort) {
            out.push({
                key: `sort:${searchParams.get("sort") || ""}`,
                label: sort,
                onRemove: () => removeParam("sort"),
            });
        }

        return out;
    }, [searchParams, router, searchType]);

    if (pills.length === 0) return null;

    const visible = pills.slice(0, 6);
    const remaining = pills.length - visible.length;

    return (
        <div className={cn("mb-5 flex flex-wrap gap-2", className)} aria-label="Active filters">
            {visible.map((pill) => (
                <Badge
                    key={pill.key}
                    variant="outline"
                    className="rounded-full border-brand-orange/20 bg-brand-orange/5 text-brand-orange pr-1.5"
                >
                    <span className="pl-1.5">{pill.label}</span>
                    <button
                        type="button"
                        onClick={pill.onRemove}
                        className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-brand-orange/10 text-brand-orange"
                        aria-label={`Remove filter: ${pill.label}`}
                        title="Remove"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </Badge>
            ))}
            {remaining > 0 && (
                <Badge variant="secondary" className="rounded-full">
                    +{remaining} more
                </Badge>
            )}
        </div>
    );
}
