import type { Category, Restaurant, RestaurantData } from "@/types";
import { Review } from "@/types/review.type";
import api from "../axios";

/**
 * Restaurant-service REST clients. Paths are relative to `NEXT_PUBLIC_API_URL` (e.g. `/api`):
 * `/restaurant`, `/products`, `/category`, `/review`, `/size`, `/productsize` — matching
 * `ResController`, `ProductController`, `CateController`, `ReviewController`, etc.
 */

/** Spring Data Page JSON for GET /restaurant */
export type RestaurantPageResponse = {
    content: Restaurant[];
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
};

const DEFAULT_LIST_LAT = "10.9032198";
const DEFAULT_LIST_LON = "106.7750317";

/**
 * `GET /restaurant/merchant/{id}` returns a single {@link ResResponse} (see `ResController`),
 * not an array. Callers that need a list should use this helper.
 */
export function merchantRestaurantsFromResponse(
    data: Restaurant | Restaurant[] | null | undefined,
): Restaurant[] {
    if (data == null) return [];
    return Array.isArray(data) ? data : [data];
}

/**
 * Loads every restaurant from the paginated GET /restaurant endpoint (admin dashboards need the full list).
 */
export async function fetchAllRestaurantsPages(extra?: URLSearchParams): Promise<Restaurant[]> {
    const base = new URLSearchParams(extra ? Array.from(extra.entries()) : []);
    if (!base.has("lat")) base.set("lat", DEFAULT_LIST_LAT);
    if (!base.has("lon")) base.set("lon", DEFAULT_LIST_LON);

    const all: Restaurant[] = [];
    let page = 0;
    const pageSize = 100;
    const maxIterations = 50;

    while (page < maxIterations) {
        const params = new URLSearchParams(base);
        params.set("page", String(page));
        params.set("size", String(pageSize));

        const res = await api.get<RestaurantPageResponse>("/query/restaurants", { params });
        const data = res.data;
        const chunk = Array.isArray(data?.content) ? data.content : [];
        all.push(...chunk);

        const totalPages = typeof data?.totalPages === "number" ? data.totalPages : chunk.length === 0 ? 0 : 1;
        page += 1;
        if (page >= totalPages || chunk.length === 0) break;
    }

    return all;
}

// Helper to build FormData in the exact format the backend expects
function buildRestaurantFormData(restaurantData: RestaurantData, imageFile?: File): FormData {
    const formData = new FormData();

    // Important:
    // 1) Create a JSON Blob
    // 2) Mark it as 'application/json'
    const jsonBlob = new Blob([JSON.stringify(restaurantData)], { type: "application/json" });

    // 3) Append the JSON Blob under the 'restaurant' key.
    // The server can now parse that part as JSON.
    formData.append("restaurant", jsonBlob);

    // Add image file if provided (browser will set its content type)
    if (imageFile) {
        formData.append("image", imageFile);
    }

    return formData;
}

export const restaurantApi = {
    getByRestaurantSlug: (slug: string) => {
        // Next.js params.slug might still be encoded or partially encoded
        // Decode it first to ensure we have the clean slug
        let cleanSlug = slug;

        // Check if slug contains encoded characters (%XX pattern)
        if (slug.includes("%")) {
            try {
                // Try to decode - this handles cases where slug is still encoded
                const decoded = decodeURIComponent(slug);
                // Only use decoded if it's different (meaning it was encoded)
                if (decoded !== slug) {
                    cleanSlug = decoded;
                }
            } catch {
                // Decode failed, slug might be malformed, use as is
                cleanSlug = slug;
            }
        }

        // Now encode it once for the API call
        const encodedSlug = encodeURIComponent(cleanSlug);
        return api.get<Restaurant>(`/restaurant/${encodedSlug}`);
    },
    getByRestaurantId: (restaurantId: string) => {
        return api.get<Restaurant>(`/restaurant/admin/${restaurantId}`);
    },
    /** Single restaurant for this merchant (backend: `ResController#getRestaurantByMerchantId`). */
    getRestaurantByMerchantId: (merchantId: string) => {
        return api.get<Restaurant>(`/restaurant/merchant/${merchantId}`);
    },
    getAllRestaurants: (params: URLSearchParams) => {
        return api.get<RestaurantPageResponse>("/query/restaurants", {
            params: params,
        });
    },
    createRestaurant: (restaurantData: RestaurantData, imageFile?: File) => {
        // Use new helper function
        const formData = buildRestaurantFormData(restaurantData, imageFile);

        // Still REMOVE header! Axios will automatically add Content-Type + boundary
        return api.post<Restaurant>("/restaurant", formData);
    },
    updateRestaurant: (restaurantId: string, restaurantData: RestaurantData, imageFile?: File) => {
        // Use new helper function
        const formData = buildRestaurantFormData(restaurantData, imageFile);

        // Still REMOVE header!
        return api.put<Restaurant>(`/restaurant/${restaurantId}`, formData);
    },
    updateRestaurantStatus: (restaurantId: string) => {
        return api.put<{ message: string }>(`/restaurant/enable/${restaurantId}`);
    },
    deleteRestaurant: (restaurantId: string) => {
        return api.delete(`/restaurant/${restaurantId}`);
    },
    deleteRestaurantImage: (restaurantId: string) => {
        return api.delete(`/restaurant/image/${restaurantId}`);
    },
    getAllCategories: () => {
        return api.get<Category[]>(`/catalog/category`);
    },
    getAllReviews: (restaurantId: string) => {
        return api.get<Review[]>(`/review?resId=${restaurantId}`);
    },
};
