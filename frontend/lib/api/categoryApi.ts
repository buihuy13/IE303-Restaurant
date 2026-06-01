import type { Category, CategoryData } from "@/types";
import api from "../axios";

// catalog-service CategoryResponse { id, cateName }
type CateResponse = {
    id: string;
    cateName: string;
    /** @deprecated legacy field from monolithic restaurant-service */
    cateId?: string;
};

const mapCateResponseToCategory = (cate: CateResponse): Category => ({
    id: String(cate.id ?? cate.cateId),
    cateName: cate.cateName,
});

export const categoryApi = {
    getAllCategories: async () => {
        const res = await api.get<CateResponse[]>("/catalog/category");
        const data: Category[] = res.data.map(mapCateResponseToCategory);
        return { ...res, data };
    },
    getCategoryById: async (categoryId: string) => {
        const res = await api.get<CateResponse>(`/catalog/category/${categoryId}`);
        const data: Category = mapCateResponseToCategory(res.data);
        return { ...res, data };
    },
    getCategoryByName: async (categoryName: string) => {
        const res = await api.get<CateResponse>(`/catalog/category/search?name=${categoryName}`);
        const data: Category = mapCateResponseToCategory(res.data);
        return { ...res, data };
    },
    createCategory: async (categoryData: CategoryData) => {
        const res = await api.post<CateResponse>("/catalog/category", categoryData);
        const data: Category = mapCateResponseToCategory(res.data);
        return { ...res, data };
    },
    updateCategory: async (categoryId: string, categoryData: CategoryData) => {
        const res = await api.put<CateResponse>(`/catalog/category/${categoryId}`, categoryData);
        const data: Category = mapCateResponseToCategory(res.data);
        return { ...res, data };
    },
    deleteCategory: (categoryId: string) => api.delete(`/catalog/category/${categoryId}`),
};
