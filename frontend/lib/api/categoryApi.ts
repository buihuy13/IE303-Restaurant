import api from "../axios";
import type { Category, CategoryData } from "@/types";

// Backend returns CateResponse { cateId, cateName }
type CateResponse = {
    cateId: string;
    cateName: string;
};

const mapCateResponseToCategory = (cate: CateResponse): Category => ({
    id: cate.cateId,
    cateName: cate.cateName,
});

export const categoryApi = {
    getAllCategories: async () => {
        const res = await api.get<CateResponse[]>("/category");
        const data: Category[] = res.data.map(mapCateResponseToCategory);
        return { ...res, data };
    },
    getCategoryById: async (categoryId: string) => {
        const res = await api.get<CateResponse>(`/category/${categoryId}`);
        const data: Category = mapCateResponseToCategory(res.data);
        return { ...res, data };
    },
    getCategoryByName: async (categoryName: string) => {
        const res = await api.get<CateResponse>(`/category/search?name=${categoryName}`);
        const data: Category = mapCateResponseToCategory(res.data);
        return { ...res, data };
    },
    createCategory: async (categoryData: CategoryData) => {
        const res = await api.post<CateResponse>("/category", categoryData);
        const data: Category = mapCateResponseToCategory(res.data);
        return { ...res, data };
    },
    updateCategory: async (categoryId: string, categoryData: CategoryData) => {
        const res = await api.put<CateResponse>(`/category/${categoryId}`, categoryData);
        const data: Category = mapCateResponseToCategory(res.data);
        return { ...res, data };
    },
    deleteCategory: (categoryId: string) => api.delete(`/category/${categoryId}`),
};
