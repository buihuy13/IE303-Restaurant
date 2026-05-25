import { productApi } from "@/lib/api/productApi";
import { sizeApi } from "@/lib/api/sizeApi";
import type { Product, ProductSize } from "@/types";

let catalogSizeNameById: Map<string, string> | null = null;

async function getCatalogSizeNameMap(): Promise<Map<string, string>> {
    if (catalogSizeNameById) {
        return catalogSizeNameById;
    }
    const res = await sizeApi.getAllSizes();
    const map = new Map<string, string>();
    for (const size of res.data ?? []) {
        if (size?.id && size?.name) {
            map.set(String(size.id), size.name);
        }
    }
    catalogSizeNameById = map;
    return map;
}

export function hasListPriceRange(product: Product): boolean {
    return product.listMinPrice != null && Number.isFinite(Number(product.listMinPrice));
}

export function getListPriceDisplay(product: Product): string | null {
    const min = product.listMinPrice != null ? Number(product.listMinPrice) : NaN;
    if (!Number.isFinite(min)) return null;
    const max =
        product.listMaxPrice != null && Number.isFinite(Number(product.listMaxPrice))
            ? Number(product.listMaxPrice)
            : min;
    if (max > min) {
        return `${min.toLocaleString("vi-VN")} – ${max.toLocaleString("vi-VN")} ₫`;
    }
    return `${min.toLocaleString("vi-VN")} ₫`;
}

function normalizeProductSizeRow(item: unknown): ProductSize | null {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    const idRaw = row.id;
    const sizeIdRaw = row.sizeId ?? row.size_id;
    const priceRaw = row.price;
    const id =
        typeof idRaw === "string"
            ? idRaw
            : idRaw != null && (typeof idRaw === "number" || typeof idRaw === "bigint")
              ? String(idRaw)
              : "";
    const sizeId =
        typeof sizeIdRaw === "string"
            ? sizeIdRaw
            : sizeIdRaw != null && (typeof sizeIdRaw === "number" || typeof sizeIdRaw === "bigint")
              ? String(sizeIdRaw)
              : "";
    const price = Number(priceRaw);
    if (!id || !Number.isFinite(price)) return null;
    const sizeNameRaw = row.sizeName ?? row.size_name ?? row.name;
    const sizeName = typeof sizeNameRaw === "string" && sizeNameRaw.trim() ? sizeNameRaw.trim() : "";
    return { id, sizeId: sizeId || id, sizeName, price };
}

export function normalizeProductSizesPayload(raw: unknown): ProductSize[] {
    if (Array.isArray(raw)) {
        return raw.map(normalizeProductSizeRow).filter((s): s is ProductSize => s != null);
    }
    if (raw && typeof raw === "object") {
        return Object.values(raw as Record<string, unknown>)
            .map(normalizeProductSizeRow)
            .filter((s): s is ProductSize => s != null);
    }
    return [];
}

/**
 * `GET /api/products/productsize/{productId}` returns JPA `ProductSize` (id, sizeId, price).
 * Resolve labels via catalog-service `GET /api/catalog/size`.
 */
export async function enrichProductSizesWithCatalogNames(sizes: ProductSize[]): Promise<ProductSize[]> {
    if (sizes.length === 0) return sizes;

    const needsCatalog = sizes.some((s) => !s.sizeName?.trim());
    if (!needsCatalog) return sizes;

    const nameMap = await getCatalogSizeNameMap();
    return sizes.map((size) => {
        if (size.sizeName?.trim()) return size;
        const catalogName = nameMap.get(size.sizeId) ?? nameMap.get(size.id);
        return {
            ...size,
            sizeName: catalogName ?? "Size",
        };
    });
}

/** Loads sizes from product detail (slug preferred) and enriches names from catalog-service. */
export async function fetchProductSizesForCart(
    productId: string,
    options?: { slug?: string | null },
): Promise<ProductSize[]> {
    const slug = typeof options?.slug === "string" ? options.slug.trim() : "";

    try {
        const res = slug
            ? await productApi.getProductBySlug(slug)
            : await productApi.getProductById(productId);
        const fromDetail = normalizeProductSizesPayload(res.data?.productSizes);
        if (fromDetail.length > 0) {
            return enrichProductSizesWithCatalogNames(fromDetail);
        }
    } catch (error) {
        console.warn("[fetchProductSizesForCart] product detail lookup failed:", error);
    }

    try {
        const res = await productApi.getProductSizesByProductId(productId);
        const normalized = normalizeProductSizesPayload(res.data);
        return enrichProductSizesWithCatalogNames(normalized);
    } catch (error) {
        console.warn("[fetchProductSizesForCart] productsize lookup failed:", error);
        return [];
    }
}

export function pickDefaultProductSize(
    sizes: ProductSize[],
    minPriceFilter: number | null = null,
): ProductSize | undefined {
    if (sizes.length === 0) return undefined;
    const sorted = [...sizes].sort((a, b) => a.price - b.price);
    if (minPriceFilter != null && Number.isFinite(minPriceFilter)) {
        return sorted.find((s) => s.price >= minPriceFilter) ?? sorted[0];
    }
    return sorted[0];
}

export function productHasMultipleSizes(product: Product): boolean {
    const sizes = product.productSizes ?? [];
    if (sizes.length > 1) {
        const prices = sizes.map((s) => s.price);
        return Math.min(...prices) !== Math.max(...prices);
    }
    const min = product.listMinPrice != null ? Number(product.listMinPrice) : NaN;
    const max = product.listMaxPrice != null ? Number(product.listMaxPrice) : NaN;
    return Number.isFinite(min) && Number.isFinite(max) && max > min;
}

/** Price line for list/grid cards (range when multiple sizes, exact when single). */
export function getProductCardPriceDisplay(
    product: Product,
    minPriceFilter: number | null = null,
): { label: string | null; hasMultipleSizes: boolean; hint: string | null } {
    const sizes = product.productSizes ?? [];

    if (sizes.length === 1) {
        const only = sizes[0];
        return {
            label: `${only.price.toLocaleString("vi-VN")} ₫`,
            hasMultipleSizes: false,
            hint: only.sizeName?.trim() || null,
        };
    }

    if (sizes.length > 1) {
        const sorted = [...sizes].sort((a, b) => a.price - b.price);
        const min = sorted[0].price;
        const max = sorted[sorted.length - 1].price;
        if (min === max) {
            return {
                label: `${min.toLocaleString("vi-VN")} ₫`,
                hasMultipleSizes: false,
                hint: `${sizes.length} sizes`,
            };
        }
        return {
            label: `${min.toLocaleString("vi-VN")} – ${max.toLocaleString("vi-VN")} ₫`,
            hasMultipleSizes: true,
            hint: `${sizes.length} sizes`,
        };
    }

    const listLabel = getListPriceDisplay(product);
    const hasMultipleSizes = productHasMultipleSizes(product);
    if (hasMultipleSizes && minPriceFilter != null && Number.isFinite(minPriceFilter)) {
        const min = Number(product.listMinPrice);
        const max = Number(product.listMaxPrice ?? product.listMinPrice);
        if (Number.isFinite(min) && Number.isFinite(max) && max > min) {
            const from = Math.max(min, minPriceFilter);
            if (from <= max) {
                return {
                    label: `${from.toLocaleString("vi-VN")} – ${max.toLocaleString("vi-VN")} ₫`,
                    hasMultipleSizes: true,
                    hint: "Choose size",
                };
            }
        }
    }

    return {
        label: listLabel,
        hasMultipleSizes,
        hint: hasMultipleSizes ? "Choose size" : null,
    };
}
