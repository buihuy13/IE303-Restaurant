import type { Product, ProductCreateData, Review } from "@/types";
import api from "../axios";

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
    getAllProducts: (params: URLSearchParams) => {
        const finalParams = new URLSearchParams(params);
        if (!finalParams.has("lat")) finalParams.set("lat", "10.9032198");
        if (!finalParams.has("lon")) finalParams.set("lon", "106.7750317");

        return api.get<PageResponse<Product>>("/products", { params: finalParams });
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
        return api.get<Product>(`/products/${encodedSlug}`);
    },
    getProductById: (productId: string) => {
        return api.get<Product>(`/products/admin/${productId}`);
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
        return api.put<Product>(`/products/availability/${productId}`);
    },
    deleteProduct: (productId: string) => {
        return api.delete(`/products/${productId}`);
    },
    deleteProductImage: (productId: string) => {
        return api.delete(`/products/image/${productId}`);
    },
    getAllReviews: (productId: string) => {
        return api.get<Review[]>(`/review?productId=${productId}`);
    },
};
