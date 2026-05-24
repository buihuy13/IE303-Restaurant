import type { Product, ProductCreateData } from "@/types";
import { buildProductQueryParams, type ProductSearchSort } from "@/lib/api/backendQueryParams";
import api from "../axios";
import { queryApi } from "./queryApi";

// Page response structure from Spring Boot
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number; // Current page (0-indexed)
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

function decodeProductSegment(segment: string): string {
    let clean = segment.trim();
    const maxAttempts = 5;
    let attempts = 0;

    while (clean.includes("%25") && attempts < maxAttempts) {
        try {
            const decoded = decodeURIComponent(clean);
            if (decoded === clean) break;
            clean = decoded;
            attempts += 1;
        } catch {
            break;
        }
    }

    if (clean.includes("%")) {
        try {
            const decoded = decodeURIComponent(clean);
            if (decoded !== clean) clean = decoded;
        } catch {
            // keep original segment
        }
    }

    return clean;
}

export const productApi = {
    getAllProducts: async (params: URLSearchParams, sort: ProductSearchSort = "relevance") => {
        const sortValue = (params.get("sort") as ProductSearchSort | null) ?? sort;
        const apiParams = buildProductQueryParams(params, sortValue);
        if (!apiParams.has("lat")) apiParams.set("lat", "10.9032198");
        if (!apiParams.has("lon")) apiParams.set("lon", "106.7750317");

        return queryApi.getProducts(apiParams);
    },
    getProductsByRestaurantId: (restaurantId: string) => {
        return api.get<Product[]>(`/products/restaurant/${restaurantId}`);
    },
    getProductSizesByProductId: (productId: string) => {
        return api.get<Product["productSizes"]>(`/products/productsize/${productId}`);
    },
    getRestaurantByProductId: (productId: string) => {
        return api.get(`/products/res/${productId}`);
    },
    /** Public detail — `GET /products/slug/{slug}` (slug only). */
    getProductBySlug: (slug: string) => {
        const cleanSlug = decodeProductSegment(slug);
        return api.get<Product>(`/products/slug/${encodeURIComponent(cleanSlug)}`);
    },
    /** Admin / legacy — `GET /products/{id}` */
    getProductById: (productId: string) => {
        return api.get<Product>(`/products/${encodeURIComponent(productId.trim())}`);
    },
    createProduct: (productData: ProductCreateData, imageFile?: File) => {
        const formData = new FormData();
        formData.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }));
        if (imageFile) formData.append("image", imageFile);

        return api.post<Product>("/products", formData);
    },
    updateProduct: (productId: string, productData: ProductCreateData, imageFile?: File) => {
        const formData = new FormData();
        formData.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }));
        if (imageFile) formData.append("image", imageFile);

        return api.put<Product>(`/products/${productId}`, formData);
    },
    updateProductStatus: (productId: string) => {
        return api.put<{ message: string }>(`/products/availability/${productId}`);
    },
    deleteProduct: (productId: string) => {
        return api.delete(`/products/${productId}`);
    },
    deleteProductImage: (productId: string) => {
        return api.delete(`/products/image/${productId}`);
    },
    getAllReviews: (productId: string) => {
        return api.get<import("@/types").ReviewListResponse>(`/review/product/${productId}`);
    },
};
