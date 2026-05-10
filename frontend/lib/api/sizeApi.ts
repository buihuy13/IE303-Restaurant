import api from "../axios";
import type { Size, SizeData } from "@/types";

export const sizeApi = {
    getAllSizes: () => api.get<Size[]>("/catalog/size"),
    getSizeById: (sizeId: string) => api.get<Size>(`/catalog/size/${sizeId}`),
    createSize: (sizeData: SizeData) => api.post<Size>("/catalog/size", sizeData),
    updateSize: (sizeId: string, sizeData: SizeData) => api.put<Size>(`/catalog/size/${sizeId}`, sizeData),
    deleteSize: (sizeId: string) => api.delete(`/catalog/size/${sizeId}`),
};
