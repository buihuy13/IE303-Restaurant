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
        return `Price: $${min}+`;
    }
    const [min, max] = decoded.split("-");
    if (min === "0" && max) return `Price: ≤ $${max}`;
    if (min && max) return `Price: $${min}–$${max}`;
    return `Price: ${decoded}`;
}

function formatRating(raw: string) {
    if (raw === "5") return "Rating: 5★";
    if (raw === "4") return "Rating: ≥ 4★";
    if (raw === "3") return "Rating: ≥ 3★";
    return `Rating: ${raw}`;
}

function formatSort(raw: string) {
    if (!raw || raw === "relevance") return null;
    if (raw === "distance") return "Sort: Nearest";
    if (raw === "popular") return "Sort: Top Sales";
    if (raw === "rating") return "Sort: Top Rated";
    return `Sort: ${raw}`;
}

function formatDistanceRange(raw: string) {
    const decoded = decodeURIComponent(raw);
    if (decoded.endsWith("+")) return `Distance: ${decoded.replace("+", "")}+ km`;
    const [min, max] = decoded.split("-");
    if (min === "0" && max) return `Distance: ≤ ${max} km`;
    if (min && max) return `Distance: ${min}–${max} km`;
    return `Distance: ${decoded}`;
}

export function ActiveFilterPills({ className }: { className?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const pills = useMemo(() => {
        const out: Array<{ key: string; label: string; onRemove: () => void }> = [];

        const removeParam = (key: string) => {
            const current = new URLSearchParams(Array.from(searchParams.entries()));
            current.delete(key);
            router.push(`/search?${current.toString()}`, { scroll: false });
        };

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

        const rating = searchParams.get("rating");
        if (rating) {
            out.push({
                key: `rating:${rating}`,
                label: formatRating(rating),
                onRemove: () => removeParam("rating"),
            });
        }

        const district = searchParams.get("district");
        if (district) {
            out.push({
                key: `district:${district}`,
                label: `Area: ${district}`,
                onRemove: () => removeParam("district"),
            });
        }

        const openNow = searchParams.get("openNow");
        if (openNow) {
            out.push({
                key: `openNow:${openNow}`,
                label: "Open now",
                onRemove: () => removeParam("openNow"),
            });
        }

        const distanceRange = searchParams.get("distanceRange");
        if (distanceRange) {
            out.push({
                key: `distanceRange:${distanceRange}`,
                label: formatDistanceRange(distanceRange),
                onRemove: () => removeParam("distanceRange"),
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
    }, [searchParams, router]);

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

