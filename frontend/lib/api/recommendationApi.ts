import api from "@/lib/axios";
import axios from "axios";

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

/** Long-running AI calls; same axios instance as the rest of the app (401 → Keycloak refresh). */
const RECOMMENDATION_TIMEOUT_MS = 120000;

export const recommendationApi = {
    suggestFoodByCraving: async (context: string, options?: RecommendationRequestOptions) => {
        const response = await api.post<RecommendationMessageResponse>(
            "/recommendations/food",
            {
                context,
            } satisfies UserContextPayload,
            {
                signal: options?.signal,
                timeout: RECOMMENDATION_TIMEOUT_MS,
            },
        );
        return response.data;
    },

    generateFoodDescriptions: async (foodName: string) => {
        const response = await api.post<RecommendationMessageResponse[]>(
            "/recommendations/descriptions",
            {
                context: foodName,
            } satisfies UserContextPayload,
            { timeout: RECOMMENDATION_TIMEOUT_MS },
        );
        return response.data;
    },

    summarizeReviews: async (payload: ReviewSummarizePayload) => {
        const response = await api.post<ReviewSummarizeResponse>("/recommendations/reviews", payload, {
            timeout: RECOMMENDATION_TIMEOUT_MS,
        });
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
