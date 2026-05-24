/** Any canonical 8-4-4-4-12 hex id (legacy URLs only — not used for public API or links). */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function looksLikeRestaurantUuid(value: string): boolean {
    return UUID_REGEX.test(value.trim());
}

type RestaurantPathSource = {
    id?: string | null;
    slug?: string | null;
    resName?: string | null;
};

/**
 * Path segment for `/restaurants/[slug]`.
 * Public restaurant-service only resolves by slug (`GET /restaurant/{slug}`).
 */
export function getRestaurantPathSegment(source?: RestaurantPathSource | null): string | null {
    if (!source) return null;

    const slug = typeof source.slug === "string" ? source.slug.trim() : "";
    return slug || null;
}

export function getRestaurantDetailHref(source?: RestaurantPathSource | null): string | null {
    const segment = getRestaurantPathSegment(source);
    return segment ? `/restaurants/${encodeURIComponent(segment)}` : null;
}

export function getRestaurantCartMeta(
    restaurant?: RestaurantPathSource | null,
): { id: string; name: string } | null {
    if (!restaurant) return null;

    const id = typeof restaurant.id === "string" ? restaurant.id.trim() : "";
    if (!id) return null;

    const name =
        typeof restaurant.resName === "string" && restaurant.resName.trim()
            ? restaurant.resName.trim()
            : "Unknown Restaurant";

    return { id, name };
}
