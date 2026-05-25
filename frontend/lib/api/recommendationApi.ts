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

export interface MoodFoodRecommendationItem {
    productId: string;
    productName?: string;
    score?: number;
    reason?: string;
}

export interface MoodFoodRecommendationPayload {
    recommendations: MoodFoodRecommendationItem[];
    summary?: string;
}

/** Long-running AI calls; same axios instance as the rest of the app (401 → Keycloak refresh). */
const RECOMMENDATION_TIMEOUT_MS = 120000;

export const recommendationApi = {
    getMoodOptions: async () => {
        const response = await api.get<string[]>("/recommendations/emotions", {
            timeout: RECOMMENDATION_TIMEOUT_MS,
        });
        return Array.isArray(response.data) ? response.data : [];
    },

    suggestFoodByMood: async (mood: string, lat: number, lon: number, options?: RecommendationRequestOptions) => {
        const response = await api.post<RecommendationMessageResponse>(
            "/recommendations/food/mood",
            {
                mood,
                lat,
                lon,
            },
            {
                signal: options?.signal,
                timeout: RECOMMENDATION_TIMEOUT_MS,
            },
        );
        return response.data;
    },

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

const unwrapPotentialJsonBlock = (raw: string) => {
    const text = raw.trim();
    const blockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (blockMatch?.[1]) return blockMatch[1].trim();
    return text;
};

export const parseMoodRecommendationResponse = (
    raw: string,
): { data: MoodFoodRecommendationPayload | null; fallbackSummary: string | null } => {
    const normalized = unwrapPotentialJsonBlock(raw);
    try {
        const parsed = JSON.parse(normalized) as Partial<MoodFoodRecommendationPayload>;
        const recommendations = Array.isArray(parsed.recommendations)
            ? parsed.recommendations
                  .map((item) => {
                      if (!item || typeof item !== "object") return null;
                      const record = item as unknown as Record<string, unknown>;
                      const productId = typeof record.productId === "string" ? record.productId.trim() : "";
                      if (!productId) return null;
                      const result: MoodFoodRecommendationItem = { productId };
                      if (typeof record.productName === "string") result.productName = record.productName;
                      if (typeof record.score === "number") result.score = record.score;
                      if (typeof record.reason === "string") result.reason = record.reason;
                      return result;
                  })
                  .filter((item): item is MoodFoodRecommendationItem => item !== null)
            : [];

        const summary = typeof parsed.summary === "string" ? parsed.summary : undefined;
        return {
            data: {
                recommendations,
                summary,
            },
            fallbackSummary: null,
        };
    } catch {
        return {
            data: null,
            fallbackSummary: normalized || null,
        };
    }
};
