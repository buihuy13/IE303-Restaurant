import type { Product, ProductCreateData, Review } from "@/types";
import api from "../axios";
import { USE_MOCK } from "../config/mockRuntime";
import { mockProducts } from "@/mock-data/products";

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

type MockProduct = (typeof mockProducts)[number];

const mapMockToProduct = (mock: MockProduct): Product => ({
    id: mock.id,
    slug: mock.slug,
    productName: mock.name,
    description: mock.description,
    imageURL: mock.imageUrl,
    publicID: undefined,
    categoryName: "Mock category",
    categoryId: mock.categoryId,
    volume: 1,
    available: mock.isAvailable,
    restaurant: null,
    totalReview: 0,
    rating: 0,
    productSizes: [],
    createdAt: mock.createdAt,
    updatedAt: mock.updatedAt,
});

export const productApi = {
    getAllProducts: (params: URLSearchParams) => {
        if (USE_MOCK) {
            const content: Product[] = mockProducts.map(mapMockToProduct);
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
            } as { data: PageResponse<Product> });
        }
        return api.get<PageResponse<Product>>("/products", { params: params });
    },
    getProductsByRestaurantId: (restaurantId: string) => {
        if (USE_MOCK) {
            const filtered: Product[] = mockProducts
                .filter((p) => p.restaurantId === restaurantId)
                .map(mapMockToProduct);
            return Promise.resolve({ data: filtered } as { data: Product[] });
        }
        return api.get<Product[]>(`/products/restaurant/${restaurantId}`);
    },
    getProductSizesByProductId: (productId: string) => {
        return api.get<Product["productSizes"]>(`/products/productsize/${productId}`);
    },
    getRestaurantByProductId: (productId: string) => {
        return api.get(`/products/res/${productId}`);
    },
    getProductBySlug: (slug: string) => {
        if (USE_MOCK) {
            const source: MockProduct =
                mockProducts.find((p) => p.slug === slug) ?? mockProducts[0];
            const product = mapMockToProduct(source);
            return Promise.resolve({ data: product } as { data: Product });
        }
        // Decode slug multiple times until no more %25 (encoded %)
        // This handles cases where slug is double or triple encoded
        let cleanSlug = slug;
        const maxAttempts = 5;
        let attempts = 0;

        // Keep decoding while slug contains %25 (which indicates double encoding)
        while (cleanSlug.includes("%25") && attempts < maxAttempts) {
            try {
                const decoded = decodeURIComponent(cleanSlug);
                // If decode doesn't change anything, we're done
                if (decoded === cleanSlug) {
                    break;
                }
                cleanSlug = decoded;
                attempts++;
            } catch {
                // Decode failed, stop trying
                break;
            }
        }

        // If slug still contains % but not %25, try one more decode
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

        // Now encode it once for the API call
        const encodedSlug = encodeURIComponent(cleanSlug);
        return api.get<Product>(`/products/${encodedSlug}`);
    },
    getProductById: (productId: string) => {
        if (USE_MOCK) {
            const source: MockProduct =
                mockProducts.find((p) => p.id === productId) ?? mockProducts[0];
            const product = mapMockToProduct(source);
            return Promise.resolve({ data: product } as { data: Product });
        }
        return api.get<Product>(`/products/admin/${productId}`);
    },
    createProduct: (productData: ProductCreateData, imageFile?: File) => {
        if (USE_MOCK) {
            const created: Product = {
                id: `mock-${Date.now()}`,
                slug: productData.productName.toLowerCase().replace(/\s+/g, "-"),
                productName: productData.productName,
                description: productData.description,
                imageURL: null,
                publicID: undefined,
                categoryName: "Mock category",
                categoryId: productData.categoryId,
                volume: 1,
                available: productData.available,
                restaurant: null,
                totalReview: 0,
                rating: 0,
                productSizes: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            return Promise.resolve({ data: created } as { data: Product });
        }
        const formData = new FormData();
        formData.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }));
        if (imageFile) formData.append("image", imageFile);

        return api.post<Product>("/products", formData);
    },
    updateProduct: (productId: string, productData: ProductCreateData, imageFile?: File) => {
        if (USE_MOCK) {
            const updated: Product = {
                id: productId,
                slug: productData.productName.toLowerCase().replace(/\s+/g, "-"),
                productName: productData.productName,
                description: productData.description,
                imageURL: null,
                publicID: undefined,
                categoryName: "Mock category",
                categoryId: productData.categoryId,
                volume: 1,
                available: productData.available,
                restaurant: null,
                totalReview: 0,
                rating: 0,
                productSizes: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            return Promise.resolve({ data: updated } as { data: Product });
        }
        const formData = new FormData();
        formData.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }));
        if (imageFile) formData.append("image", imageFile);

        return api.put<Product>(`/products/${productId}`, formData);
    },
    updateProductStatus: (productId: string) => {
        if (USE_MOCK) {
            const source: MockProduct =
                mockProducts.find((p) => p.id === productId) ?? mockProducts[0];
            const toggled: MockProduct = {
                ...source,
                isAvailable: !source.isAvailable,
            };
            const product = mapMockToProduct(toggled);
            return Promise.resolve({ data: product } as { data: Product });
        }
        return api.put<Product>(`/products/availability/${productId}`);
    },
    deleteProduct: (productId: string) => {
        if (USE_MOCK) {
            return Promise.resolve({ data: null } as { data: null });
        }
        return api.delete(`/products/${productId}`);
    },
    deleteProductImage: (productId: string) => {
        if (USE_MOCK) {
            return Promise.resolve({ data: null } as { data: null });
        }
        return api.delete(`/products/image/${productId}`);
    },
    getAllReviews: (productId: string) => {
        if (USE_MOCK) {
            return Promise.resolve({ data: [] as Review[] });
        }
        return api.get<Review[]>(`/review?productId=${productId}`);
    },
};
