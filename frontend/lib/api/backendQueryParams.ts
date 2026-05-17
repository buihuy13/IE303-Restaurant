/**
 * Maps UI URLSearchParams → query-service DTOs only.
 * Do not add client-side filtering/sorting beyond what the API returns.
 */

export type RestaurantSearchSort = "relevance" | "rating" | "popular";
export type ProductSearchSort = "relevance" | "distance" | "rating" | "popular";

export function parseRestaurantSort(value: string | null | undefined): RestaurantSearchSort {
    if (value === "rating" || value === "popular") return value;
    return "relevance";
}

export function parseProductSort(value: string | null | undefined): ProductSearchSort {
    if (value === "distance" || value === "rating" || value === "popular") return value;
    return "relevance";
}

const RESTAURANT_STRIP = [
    "district",
    "openNow",
    "distanceRange",
    "sort",
    "order",
    "type",
    "q",
    "category",
    "priceRange",
    "special",
    "rating",
    "locationsorted",
] as const;

const PRODUCT_STRIP = [
    "district",
    "openNow",
    "distanceRange",
    "sort",
    "order",
    "type",
    "q",
    "priceRange",
    "special",
    "rating",
    "locationsorted",
] as const;

/**
 * `RestaurantQuery`: lat, lon, nearby, search, rating=desc, enabled + Spring page/size.
 * No district / openNow / distanceRange / locationsorted.
 */
export function buildRestaurantQueryParams(
    params: URLSearchParams,
    sort: RestaurantSearchSort = "relevance",
): URLSearchParams {
    const api = new URLSearchParams(params);
    if (api.has("q") && !api.has("search")) {
        api.set("search", api.get("q")!);
    }
    for (const key of RESTAURANT_STRIP) {
        api.delete(key);
    }
    if (sort === "rating" || sort === "popular") {
        api.set("rating", "desc");
    }
    return api;
}

/**
 * `ProductQuery`: lat, lon, nearby, search, category, minPrice, maxPrice,
 * rating=desc, locationsorted=asc + Spring page/size.
 */
export function buildProductQueryParams(
    params: URLSearchParams,
    sort: ProductSearchSort = "relevance",
): URLSearchParams {
    const api = new URLSearchParams(params);
    if (api.has("q") && !api.has("search")) {
        api.set("search", api.get("q")!);
    }
    for (const key of PRODUCT_STRIP) {
        api.delete(key);
    }
    if (sort === "distance") {
        api.set("locationsorted", "asc");
    } else if (sort === "rating" || sort === "popular") {
        api.set("rating", "desc");
    }
    return api;
}

/** Params supported on GET /api/query/restaurants (for URL → API builders). */
export function buildRestaurantSearchParamsFromUrl(searchParams: URLSearchParams, lat: number, lon: number): URLSearchParams {
    const params = new URLSearchParams();
    params.set("lat", String(lat));
    params.set("lon", String(lon));

    const search = searchParams.get("q") || searchParams.get("search");
    if (search?.trim()) params.set("search", search.trim());

    const nearby = searchParams.get("nearby");
    if (nearby?.trim()) params.set("nearby", nearby.trim());

    const page = searchParams.get("page");
    params.set("page", page ? String(Math.max(0, parseInt(page, 10) - 1)) : "0");
    params.set("size", searchParams.get("size") || "12");

    return params;
}

/** Params supported on GET /api/query/products. */
export function buildProductSearchParamsFromUrl(searchParams: URLSearchParams, lat: number, lon: number): URLSearchParams {
    const params = buildRestaurantSearchParamsFromUrl(searchParams, lat, lon);

    const categories = searchParams.getAll("category");
    if (categories.length > 0) {
        params.set("category", categories.map((c) => c.toLowerCase()).join(","));
    }

    const priceRange = searchParams.get("priceRange");
    if (priceRange) {
        const decoded = decodeURIComponent(priceRange);
        if (decoded.endsWith("+")) {
            const min = parseFloat(decoded.replace("+", ""));
            if (!isNaN(min) && min > 0) params.set("minPrice", String(min));
        } else {
            const [min, max] = decoded.split("-");
            const minPrice = min ? parseFloat(min) : NaN;
            const maxPrice = max ? parseFloat(max) : NaN;
            if (!isNaN(minPrice) && minPrice > 0) params.set("minPrice", String(minPrice));
            if (!isNaN(maxPrice) && maxPrice > 0) params.set("maxPrice", String(maxPrice));
        }
    }

    return params;
}
