import type { Category, Restaurant, RestaurantData } from "@/types";
import { Review } from "@/types/review.type";
import api from "../axios";
import { USE_MOCK_RESTAURANT } from "../config/mockRuntime";
import { mockRestaurants } from "@/mock-data/restaurants";
import { mockCategories } from "@/mock-data/categories";

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

type MockRestaurant = (typeof mockRestaurants)[number];

const mapMockToRestaurant = (mock: MockRestaurant): Restaurant => ({
    id: mock.id,
    slug: mock.slug,
    resName: mock.name,
    address: mock.address,
    longitude: 0,
    latitude: 0,
    rating: mock.rating,
    openingTime: mock.openTime,
    closingTime: mock.closeTime,
    phone: "",
    imageURL: mock.imageUrl,
    publicID: undefined,
    merchantId: "",
    managerId: undefined,
    enabled: mock.isActive,
    totalReview: mock.reviewCount,
    distance: 0,
    duration: 0,
    products: [],
    cate: [],
    createdAt: mock.createdAt,
    updatedAt: mock.updatedAt,
});

export const restaurantApi = {
    getByRestaurantSlug: (slug: string) => {
        if (USE_MOCK_RESTAURANT) {
            const source: MockRestaurant | undefined = mockRestaurants.find((r) => r.slug === slug);
            const restaurant = mapMockToRestaurant(source ?? mockRestaurants[0]);
            return Promise.resolve({
                data: restaurant,
            } as { data: Restaurant });
        }
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
        if (USE_MOCK_RESTAURANT) {
            const source: MockRestaurant | undefined = mockRestaurants.find((r) => r.id === restaurantId);
            const restaurant = mapMockToRestaurant(source ?? mockRestaurants[0]);
            return Promise.resolve({ data: restaurant } as { data: Restaurant });
        }
        return api.get<Restaurant>(`/restaurant/admin/${restaurantId}`);
    },
    getRestaurantByMerchantId: (merchantId: string) => {
        if (USE_MOCK_RESTAURANT) {
            const data: Restaurant[] = mockRestaurants.map(mapMockToRestaurant);
            return Promise.resolve({ data } as { data: Restaurant[] });
        }
        return api.get<Restaurant[]>(`/restaurant/merchant/${merchantId}`);
    },
    getAllRestaurants: (params: URLSearchParams) => {
        if (USE_MOCK_RESTAURANT) {
            const content: Restaurant[] = mockRestaurants.map(mapMockToRestaurant);
            return Promise.resolve({
                data: {
                    content,
                    totalElements: content.length,
                    totalPages: 1,
                    size: content.length,
                    number: 0,
                    numberOfElements: content.length,
                    first: true,
                    last: true,
                    empty: content.length === 0,
                },
            } as {
                data: { content: Restaurant[]; totalElements: number; totalPages: number };
            });
        }
        return api.get<{ content: Restaurant[]; totalElements: number; totalPages: number }>("/restaurant", {
            params: params,
        });
    },
    createRestaurant: (restaurantData: RestaurantData, imageFile?: File) => {
        if (USE_MOCK_RESTAURANT) {
            const created: Restaurant = {
                id: `mock-rest-${Date.now()}`,
                slug: restaurantData.resName.toLowerCase().replace(/\s+/g, "-"),
                resName: restaurantData.resName,
                address: restaurantData.address,
                longitude: restaurantData.longitude,
                latitude: restaurantData.latitude,
                rating: restaurantData.rating ?? 0,
                openingTime: restaurantData.openingTime,
                closingTime: restaurantData.closingTime,
                phone: restaurantData.phone,
                imageURL: null,
                publicID: undefined,
                merchantId: restaurantData.merchantId,
                managerId: undefined,
                enabled: true,
                totalReview: 0,
                distance: 0,
                duration: 0,
                products: [],
                cate: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            return Promise.resolve({ data: created } as { data: Restaurant });
        }
        // Use new helper function
        const formData = buildRestaurantFormData(restaurantData, imageFile);

        // Still REMOVE header! Axios will automatically add Content-Type + boundary
        return api.post<Restaurant>("/restaurant", formData);
    },
    updateRestaurant: (restaurantId: string, restaurantData: RestaurantData, imageFile?: File) => {
        if (USE_MOCK_RESTAURANT) {
            const updated: Restaurant = {
                id: restaurantId,
                slug: restaurantData.resName.toLowerCase().replace(/\s+/g, "-"),
                resName: restaurantData.resName,
                address: restaurantData.address,
                longitude: restaurantData.longitude,
                latitude: restaurantData.latitude,
                rating: restaurantData.rating ?? 0,
                openingTime: restaurantData.openingTime,
                closingTime: restaurantData.closingTime,
                phone: restaurantData.phone,
                imageURL: null,
                publicID: undefined,
                merchantId: restaurantData.merchantId,
                managerId: undefined,
                enabled: true,
                totalReview: 0,
                distance: 0,
                duration: 0,
                products: [],
                cate: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            return Promise.resolve({ data: updated } as { data: Restaurant });
        }
        // Use new helper function
        const formData = buildRestaurantFormData(restaurantData, imageFile);

        // Still REMOVE header!
        return api.put<Restaurant>(`/restaurant/${restaurantId}`, formData);
    },
    updateRestaurantStatus: (restaurantId: string) => {
        if (USE_MOCK_RESTAURANT) {
            const source: MockRestaurant =
                mockRestaurants.find((r) => r.id === restaurantId) ?? mockRestaurants[0];
            const toggled: MockRestaurant = {
                ...source,
                isActive: !source.isActive,
            };
            const restaurant = mapMockToRestaurant(toggled);
            return Promise.resolve({
                data: restaurant,
            });
        }
        return api.put<{ message: string }>(`/restaurant/enable/${restaurantId}`);
    },
    deleteRestaurant: (restaurantId: string) => {
        if (USE_MOCK_RESTAURANT) {
            return Promise.resolve({ data: null } as { data: null });
        }
        return api.delete(`/restaurant/${restaurantId}`);
    },
    deleteRestaurantImage: (restaurantId: string) => {
        if (USE_MOCK_RESTAURANT) {
            return Promise.resolve({ data: null } as { data: null });
        }
        return api.delete(`/restaurant/image/${restaurantId}`);
    },
    getAllCategories: () => {
        if (USE_MOCK_RESTAURANT) {
            const data: Category[] = mockCategories.map((c) => ({
                id: c.id,
                cateName: (c as { name: string }).name,
            }));
            return Promise.resolve({ data } as { data: Category[] });
        }
        return api.get<Category[]>(`/category`);
    },
    getAllReviews: (restaurantId: string) => {
        if (USE_MOCK_RESTAURANT) {
            return Promise.resolve({ data: [] as Review[] });
        }
        return api.get<Review[]>(`/review?resId=${restaurantId}`);
    },
};
