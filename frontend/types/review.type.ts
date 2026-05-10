export interface Review {
        id: string;
        userId: string;
        reviewId: string;
        reviewType: "PRODUCT" | "RESTAURANT";
        title: string;
        content?: string | null;
        rating: number;
        createdAt: string | null;
        updatedAt?: string | null;
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
