/** Any canonical 8-4-4-4-12 hex id (legacy URLs only — not used for public links). */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function looksLikeProductUuid(value: string): boolean {
    return UUID_REGEX.test(value.trim());
}

type ProductPathSource = {
    id?: string | null;
    slug?: string | null;
};

/**
 * Path segment for `/food/[slug]`.
 * Public product-service detail uses `GET /products/slug/{slug}` only.
 */
export function getProductPathSegment(source?: ProductPathSource | null): string | null {
    if (!source) return null;

    const slug = typeof source.slug === "string" ? source.slug.trim() : "";
    return slug || null;
}

export function getProductDetailHref(source?: ProductPathSource | null): string | null {
    const segment = getProductPathSegment(source);
    return segment ? `/food/${encodeURIComponent(segment)}` : null;
}
