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
    getProductBySlug: (slug: string) => {
        let cleanSlug = slug;
        const maxAttempts = 5;
        let attempts = 0;

        while (cleanSlug.includes("%25") && attempts < maxAttempts) {
            try {
                const decoded = decodeURIComponent(cleanSlug);
                if (decoded === cleanSlug) {
                    break;
                }
                cleanSlug = decoded;
                attempts++;
            } catch {
                break;
            }
        }

        if (cleanSlug.includes("%") && !cleanSlug.includes("%25")) {
            try {
                const decoded = decodeURIComponent(cleanSlug);
                if (decoded !== cleanSlug) {
                    cleanSlug = decoded;
                }
            } catch {
                // Ignore decode errors
            }
        }

        const encodedSlug = encodeURIComponent(cleanSlug);
        return api.get<Product>(`/products/slug/${encodedSlug}`);
    },
    getProductById: (productId: string) => {
        return api.get<Product>(`/products/${productId}`);
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
