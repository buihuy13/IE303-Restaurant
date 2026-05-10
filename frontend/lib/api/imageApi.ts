import api from "../axios";

export interface ImageUploadResponse {
    publicId: string;
    url: string;
    secureUrl: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}

export interface TransformRequest {
    publicId: string;
    transformations?: Record<string, unknown>;
}

export const imageApi = {
    uploadImage: async (file: File, folder?: string) => {
        const formData = new FormData();
        formData.append("file", file);
        if (folder) {
            formData.append("folder", folder);
        }

        const response = await api.post<ImageUploadResponse>("/images/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    deleteImage: (publicId: string) => {
        return api.delete(`/images/${publicId}`);
    },

    getImageUrl: (publicId: string) => {
        return api.get<string>(`/images/${publicId}`);
    },

    transformImage: (request: TransformRequest) => {
        return api.post<string>("/images/transform", request);
    },
};
