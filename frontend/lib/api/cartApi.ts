import api from "../axios";
import { isCanonicalUuid } from "@/lib/utils/uuid";
import { withOrderServiceBase } from "./serviceBaseConfig";

export interface CartItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    sizeId?: string;
    sizeName?: string;
    customizations?: string;
    subtotal: number;
    imageURL?: string;
    cartItemImage?: string;
}

export interface Restaurant {
    restaurantId: string;
    restaurantName: string;
}

export interface RestaurantCart {
    restaurantId: string;
    restaurantName: string;
    restaurantSlug?: string;
    restaurantImage?: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    totalAmount: number;
    notes?: string;
    deliveryAddress?: string;
}

export interface Cart {
    userId: string;
    restaurants: RestaurantCart[];
    createdAt: string;
    updatedAt: string;
}

export interface CartResponse {
    userId?: string;
    restaurants?: RestaurantCart[];
    createdAt?: string;
    updatedAt?: string;
}

export interface AddItemToCartRequest {
    restaurant: Restaurant;
    item: Omit<CartItem, "subtotal"> & {
        cartItemImage?: string;
        image?: string;
    };
}

export const cartApi = {
    getCart: async (_userId: string) => {
        void _userId;
        const response = await api.get<CartResponse>("/cart", withOrderServiceBase());
        return response.data;
    },

    addItemToCart: async (_userId: string, data: AddItemToCartRequest) => {
        void _userId;
        const restaurantId = data.restaurant.restaurantId.trim();
        const baseProductId = data.item.productId.split("--")[0].trim();
        const sizeId = data.item.sizeId?.trim();

        if (!isCanonicalUuid(restaurantId)) {
            throw new Error("Invalid restaurant identifier. Please refresh and try again.");
        }

        if (!isCanonicalUuid(baseProductId)) {
            throw new Error("Invalid product identifier. Please re-open the item and try again.");
        }

        if (!sizeId) {
            throw new Error("Please select a size before adding to cart.");
        }

        if (!isCanonicalUuid(sizeId)) {
            throw new Error("Invalid size identifier. Please select the size again.");
        }

        const payload = {
            restaurantId,
            productId: baseProductId,
            productSizeId: sizeId,
            quantity: data.item.quantity,
        };

        const response = await api.post<CartResponse>("/cart", payload, withOrderServiceBase());
        return response.data;
    },

    updateItemQuantity: async (
        userId: string,
        restaurantId: string,
        productId: string,
        quantity: number,
        sizeId?: string,
        customizations?: string,
    ) => {
        void userId;
        void restaurantId;
        void productId;
        void customizations;

        if (!sizeId?.trim()) {
            throw new Error("Missing product size identifier for cart update.");
        }

        if (!isCanonicalUuid(sizeId)) {
            throw new Error("Invalid size identifier. Please reload the cart and try again.");
        }

        const response = await api.put<CartResponse>(
            "/cart",
            {
                productSizeId: sizeId,
                quantity,
            },
            withOrderServiceBase(),
        );
        return response.data;
    },

    removeItemFromCart: async (
        userId: string,
        restaurantId: string,
        productId: string,
        sizeId?: string,
        customizations?: string,
    ) => {
        return cartApi.updateItemQuantity(userId, restaurantId, productId, 0, sizeId, customizations);
    },

    clearRestaurant: async (userId: string, restaurantId: string) => {
        void userId;

        const cart = await cartApi.getCart("");
        const restaurants = Array.isArray(cart.restaurants) ? cart.restaurants : [];
        const group = restaurants.find((restaurant) => restaurant.restaurantId === restaurantId);
        const groupItems = Array.isArray(group?.items) ? group!.items : [];

        let latest: CartResponse = cart;
        for (const item of groupItems) {
            if (!item.sizeId) {
                continue;
            }
            latest = await cartApi.updateItemQuantity("", restaurantId, item.productId, 0, item.sizeId);
        }
        return latest;
    },

    clearCart: async (_userId: string) => {
        void _userId;
        const response = await api.delete("/cart", withOrderServiceBase());
        return response.data;
    },
};
