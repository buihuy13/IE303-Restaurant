import type { Product, Restaurant } from "@/types";
import { orsDurationSecondsToDisplayMinutes } from "@/lib/utils/routeDuration";
import type { PageResponse } from "./productApi";

/** Raw DTO from `GET /api/query/restaurants` (query-service). */
export type RestaurantQueryDto = {
    id: string;
    resName: string;
    address: string;
    latitude: number;
    longitude: number;
    rating: number;
    openingTime: string;
    closingTime: string;
    phone: string;
    imageURL: string | null;
    merchantId: string;
    enabled: boolean;
    totalReview: number;
    slug: string;
    distance?: number | null;
    duration?: number | null;
    createdAt?: string;
    updatedAt?: string;
};

/** Raw DTO from `GET /api/query/products` (query-service). */
export type ProductQueryDto = {
    id: string;
    productName: string;
    description: string;
    imageURL: string | null;
    categoryName: string;
    categoryId: string;
    restaurantName: string;
    restaurantId: string;
    available: boolean;
    totalReview: number;
    rating: number;
    minPrice?: number | null;
    maxPrice?: number | null;
    slug: string;
    distance?: number | null;
    duration?: number | null;
    createdAt?: string;
    updatedAt?: string;
};

export function mapRestaurantQueryDto(dto: RestaurantQueryDto): Restaurant {
    return {
        id: String(dto.id),
        slug: dto.slug,
        resName: dto.resName,
        address: dto.address ?? "",
        latitude: dto.latitude ?? 0,
        longitude: dto.longitude ?? 0,
        rating: Number(dto.rating ?? 0),
        openingTime: dto.openingTime ?? "00:00",
        closingTime: dto.closingTime ?? "00:00",
        phone: dto.phone ?? "",
        imageURL: dto.imageURL ?? null,
        merchantId: String(dto.merchantId ?? ""),
        enabled: Boolean(dto.enabled),
        totalReview: dto.totalReview ?? 0,
        distance: typeof dto.distance === "number" ? dto.distance : 0,
        duration: orsDurationSecondsToDisplayMinutes(dto.duration),
        products: [],
        cate: [],
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
    };
}

export function mapProductQueryDto(dto: ProductQueryDto): Product {
    const restaurantId = dto.restaurantId ? String(dto.restaurantId) : "";
    return {
        id: String(dto.id),
        slug: dto.slug,
        productName: dto.productName,
        description: dto.description ?? "",
        imageURL: dto.imageURL ?? null,
        categoryName: dto.categoryName ?? "",
        categoryId: String(dto.categoryId ?? ""),
        volume: 0,
        available: Boolean(dto.available),
        totalReview: dto.totalReview ?? 0,
        rating: Number(dto.rating ?? 0),
        productSizes: [],
        listMinPrice: dto.minPrice != null ? Number(dto.minPrice) : null,
        listMaxPrice: dto.maxPrice != null ? Number(dto.maxPrice) : null,
        restaurant: restaurantId
            ? {
                  id: restaurantId,
                  slug: "",
                  resName: dto.restaurantName ?? "",
                  address: "",
                  longitude: 0,
                  latitude: 0,
                  rating: 0,
                  openingTime: "00:00",
                  closingTime: "00:00",
                  phone: "",
                  imageURL: null,
                  merchantId: "",
                  enabled: true,
                  totalReview: 0,
                  distance: typeof dto.distance === "number" ? dto.distance : 0,
                  duration: orsDurationSecondsToDisplayMinutes(dto.duration),
                  products: [],
                  cate: [],
              }
            : null,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
    };
}

export function mapRestaurantPage(data: PageResponse<RestaurantQueryDto>): PageResponse<Restaurant> {
    return {
        ...data,
        content: (data.content ?? []).map(mapRestaurantQueryDto),
    };
}

export function mapProductPage(data: PageResponse<ProductQueryDto>): PageResponse<Product> {
    return {
        ...data,
        content: (data.content ?? []).map(mapProductQueryDto),
    };
}
