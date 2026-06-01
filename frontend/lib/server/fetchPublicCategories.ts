import { API_URL } from "@/lib/config/publicRuntime";
import type { Category } from "@/types";

type CateResponse = { id: string; cateName: string; cateId?: string };

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

/** Server-side categories for `(client)/search` — same path as `categoryApi` (`/catalog/category`). */
export async function fetchPublicCategoriesForSearch(): Promise<Category[]> {
    const base = trimTrailingSlash(API_URL);
    try {
        const res = await fetch(`${base}/catalog/category`, {
            next: { revalidate: 120 },
        });
        if (!res.ok) return [];
        const raw = (await res.json()) as unknown;
        if (!Array.isArray(raw)) return [];
        return (raw as CateResponse[]).map((c) => ({
            id: String(c.id ?? c.cateId),
            cateName: c.cateName,
        }));
    } catch {
        return [];
    }
}
