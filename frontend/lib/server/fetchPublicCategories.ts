import { API_URL } from "@/lib/config/publicRuntime";
import type { Category } from "@/types";

type CateResponse = { cateId: string; cateName: string };

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

/** Server-side categories for `(client)/search` — same path as `categoryApi` (`/api/category` when `API_URL` ends with `/api`). */
export async function fetchPublicCategoriesForSearch(): Promise<Category[]> {
    const base = trimTrailingSlash(API_URL);
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
