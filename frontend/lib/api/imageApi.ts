import { useAuthStore } from "@/stores/useAuthStore";
import api from "../axios";

function requireAuthenticatedSession(): void {
    if (typeof window === "undefined") {
        throw new Error("Image upload is only available in the browser.");
    }
    const fromStore = useAuthStore.getState().accessToken?.trim();
    const fromStorage = localStorage.getItem("accessToken")?.trim();
    const token = fromStore || fromStorage;
    if (!token || token === "null" || token === "undefined") {
        throw new Error("Please sign in to upload images.");
    }
}

export interface ImageUploadResponse {
    publicId: string;
    url: string;
    secureUrl: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}

/** image-service via gateway — `POST /api/images/upload` requires a JWT (not public). */
export const imageApi = {
    uploadImage: async (file: File, folder?: string) => {
        requireAuthenticatedSession();
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
        requireAuthenticatedSession();
        return api.delete(`/images/${publicId}`);
    },
};
