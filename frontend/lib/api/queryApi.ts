import api from "../axios";
import type { PageResponse } from "./productApi";
import {
    mapProductPage,
    mapRestaurantQueryDto,
    mapRestaurantPage,
    type ProductQueryDto,
    type RestaurantQueryDto,
} from "./queryMappers";

/**
 * query-service list endpoints (distance, search, pagination).
 * Replaces legacy `GET /restaurant` and `GET /products` list APIs removed from restaurant/product services.
 */
export const queryApi = {
    getRestaurants: async (params: URLSearchParams) => {
        const res = await api.get<PageResponse<RestaurantQueryDto>>("/query/restaurants", { params });
        return { ...res, data: mapRestaurantPage(res.data) };
    },

    getProducts: async (params: URLSearchParams) => {
        const res = await api.get<PageResponse<ProductQueryDto>>("/query/products", { params });
        return { ...res, data: mapProductPage(res.data) };
    },

    /** `GET /api/query/restaurants/{id}` — distance/duration when lat/lon are provided. */
    getRestaurantById: async (id: string, lat?: number, lon?: number) => {
        const params = new URLSearchParams();
        if (lat != null && lon != null) {
            params.set("lat", String(lat));
            params.set("lon", String(lon));
        }
        const res = await api.get<RestaurantQueryDto>(`/query/restaurants/${id}`, {
            params: params.toString() ? params : undefined,
        });
        return { ...res, data: mapRestaurantQueryDto(res.data) };
    },
};

export type { RestaurantQueryDto, ProductQueryDto };
