import api from "../axios";
import type { Category, CategoryData } from "@/types";
import { USE_MOCK } from "../config/mockRuntime";
import { mockCategories } from "@/mock-data/categories";

export const categoryApi = {
    getAllCategories: () => {
        if (USE_MOCK) {
            const data: Category[] = mockCategories.map((c) => ({
                id: c.id,
                cateName: (c as { name: string }).name,
            }));
            return Promise.resolve({ data } as { data: Category[] });
        }
        return api.get<Category[]>("/category");
    },
    getCategoryById: (categoryId: string) => {
        if (USE_MOCK) {
            const source =
                mockCategories.find((c) => c.id === categoryId) ?? mockCategories[0];
            const category: Category = {
                id: source.id,
                cateName: (source as { name: string }).name,
            };
            return Promise.resolve({ data: category } as { data: Category });
        }
        return api.get<Category>(`/category/${categoryId}`);
    },
    getCategoryByName: (categoryName: string) => {
        if (USE_MOCK) {
            const source =
                mockCategories.find(
                    (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
                ) ?? mockCategories[0];
            const category: Category = {
                id: source.id,
                cateName: (source as { name: string }).name,
            };
            return Promise.resolve({ data: category } as { data: Category });
        }
        return api.get<Category>(`/category/search?name=${categoryName}`);
    },
    createCategory: (categoryData: CategoryData) => {
        if (USE_MOCK) {
            const created: Category = {
                id: `mock-cate-${Date.now()}`,
                cateName: categoryData.cateName,
            };
            return Promise.resolve({ data: created } as { data: Category });
        }
        return api.post<Category>("/category", categoryData);
    },
    updateCategory: (categoryId: string, categoryData: CategoryData) => {
        if (USE_MOCK) {
            const updated: Category = {
                id: categoryId,
                cateName: categoryData.cateName,
            };
            return Promise.resolve({ data: updated } as { data: Category });
        }
        return api.put<Category>(`/category/${categoryId}`, categoryData);
    },
    deleteCategory: (categoryId: string) => {
        if (USE_MOCK) {
            return Promise.resolve({ data: null } as { data: null });
        }
        return api.delete(`/category/${categoryId}`);
    },
};
