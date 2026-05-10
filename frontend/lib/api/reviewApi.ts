import api from "../axios";
import { Review } from "@/types";

export interface ReviewData {
    userId: string;
    reviewId: string; // restaurantId or productId
    reviewType: "RESTAURANT" | "PRODUCT";
    title: string;
    content: string;
    rating: number;
}

export interface ReviewListResponse {
    reviews: Review[];
    total: number;
}

export interface ReviewStatsResponse {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
}

export const reviewApi = {
    // Get reviews by restaurant
    getReviewsByRestaurant: async (restaurantId: string) => {
        const response = await api.get<ReviewListResponse>(`/review/restaurant/${restaurantId}`);
        return response.data.reviews;
    },

    // Get reviews by product
    getReviewsByProduct: async (productId: string) => {
        const response = await api.get<ReviewListResponse>(`/review/product/${productId}`);
        return response.data.reviews;
    },
    getProductReviewSummary: async (productId: string) => {
        const response = await api.get<ReviewListResponse>(`/review/product/${productId}`);
        return response.data;
    },
    getRestaurantReviewSummary: async (restaurantId: string) => {
        const response = await api.get<ReviewListResponse>(`/review/restaurant/${restaurantId}`);
        return response.data;
    },

    // Get review stats
    getProductReviewStats: async (productId: string) => {
        const response = await api.get<ReviewStatsResponse>(`/review/stats/product/${productId}`);
        return response.data;
    },
    getRestaurantReviewStats: async (restaurantId: string) => {
        const response = await api.get<ReviewStatsResponse>(`/review/stats/restaurant/${restaurantId}`);
        return response.data;
    },

    // Get review by ID
    getReviewById: async (reviewId: string) => {
        const response = await api.get<Review>(`/review/${reviewId}`);
        return response.data;
    },

    // Create review
    createReview: async (reviewData: ReviewData) => {
        const response = await api.post<Review>("/review", reviewData);
        return response.data;
    },

    // Delete review
    deleteReview: async (reviewId: string, userId: string) => {
        const response = await api.delete(`/review/${reviewId}?userId=${userId}`);
        return response.data;
    },
};
