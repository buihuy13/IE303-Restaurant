import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";
import { API_URL } from "../config/publicRuntime";

export type ReviewType = "RESTAURANT" | "PRODUCT";

export interface UserContextPayload {
    context: string;
}

export interface RecommendationMessageResponse {
    response: string;
}

export interface ReviewSummarizeResponse {
    summary: string;
    improvements: string[];
}

export interface ReviewSummarizePayload {
    id: string;
    rvType: ReviewType;
}

export interface RecommendationRequestOptions {
    signal?: AbortSignal;
}

const recommendationClient = axios.create({
    baseURL: API_URL,
    timeout: 120000,
    withCredentials: true,
    maxRedirects: 0,
    validateStatus: (status) => status < 400,
});

const normalizeToken = (value: string | null): string | null => {
    if (!value) return null;
    const token = value.trim();
    if (!token || token === "null" || token === "undefined") return null;
    return token;
};

recommendationClient.interceptors.request.use((config) => {
    const accessTokenFromStore = normalizeToken(useAuthStore.getState().accessToken);
    const accessTokenFromStorage =
        typeof window !== "undefined" ? normalizeToken(localStorage.getItem("accessToken")) : null;
    const accessToken = accessTokenFromStore || accessTokenFromStorage;
    if (accessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

export const recommendationApi = {
    suggestFoodByCraving: async (context: string, options?: RecommendationRequestOptions) => {
        const response = await recommendationClient.post<RecommendationMessageResponse>(
            "/recommendations/food",
            {
                context,
            } satisfies UserContextPayload,
            {
                signal: options?.signal,
            },
        );
        return response.data;
    },

    generateFoodDescriptions: async (foodName: string) => {
        const response = await recommendationClient.post<RecommendationMessageResponse[]>("/recommendations/descriptions", {
            context: foodName,
        } satisfies UserContextPayload);
        return response.data;
    },

    summarizeReviews: async (payload: ReviewSummarizePayload) => {
        const response = await recommendationClient.post<ReviewSummarizeResponse>("/recommendations/reviews", payload);
        return response.data;
    },
};

export const isRecommendationUnauthorizedError = (error: unknown) =>
    axios.isAxiosError(error) && error.response?.status === 401;

export const isRecommendationForbiddenError = (error: unknown) =>
    axios.isAxiosError(error) && error.response?.status === 403;

export const getRecommendationErrorMessage = (error: unknown): string | null => {
    if (!axios.isAxiosError(error)) return null;
    const data = error.response?.data;
    if (!data || typeof data !== "object") return null;
    const message = "message" in data ? data.message : null;
    return typeof message === "string" && message.trim() ? message.trim() : null;
};
