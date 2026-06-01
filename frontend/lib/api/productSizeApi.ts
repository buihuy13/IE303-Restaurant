import api from "../axios";

export interface ProductSizeResponse {
    id: string;
    sizeId: string;
    sizeName: string;
    price: number;
}

export interface ProductSizeCreateRequest {
    productId: string;
    sizeId: string;
    price: number;
}

export interface ProductSizeUpdateRequest {
    price: number;
}

export const productSizeApi = {
    getProductSizeById: (id: string) => api.get<ProductSizeResponse>(`/productsize/${id}`),
    createProductSize: (payload: ProductSizeCreateRequest) =>
        api.post<ProductSizeResponse>("/productsize", payload),
    updateProductSize: (id: string, payload: ProductSizeUpdateRequest) =>
        api.put<ProductSizeResponse>(`/productsize/${id}`, payload),
    deleteProductSize: (id: string) => api.delete<{ message: string }>(`/productsize/${id}`),
};
