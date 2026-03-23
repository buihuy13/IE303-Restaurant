import SearchPageClient from "@/components/client/search/SearchPageClient";
import { API_URL } from "@/lib/config/publicRuntime";
import type { Category } from "@/types";

type CateResponse = { cateId: string; cateName: string };

async function getInitialCategories(): Promise<Category[]> {
    const base = API_URL.replace(/\/+$/, "");
    try {
        const res = await fetch(`${base}/category`, {
            next: { revalidate: 120 },
        });
        if (!res.ok) return [];
        const raw = (await res.json()) as unknown;
        if (!Array.isArray(raw)) return [];
        return (raw as CateResponse[]).map((c) => ({
            id: c.cateId,
            cateName: c.cateName,
        }));
    } catch {
        return [];
    }
}

export default async function SearchPage() {
    const initialCategories = await getInitialCategories();

    return <SearchPageClient initialCategories={initialCategories} />;
}
