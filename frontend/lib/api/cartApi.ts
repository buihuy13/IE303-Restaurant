import api from "../axios";

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
    status: "success" | "error";
    message: string;
    data: Cart | null;
}

export interface AddItemToCartRequest {
    restaurant: Restaurant;
    item: Omit<CartItem, "subtotal"> & {
        cartItemImage?: string;
        image?: string;
    };
}

export const cartApi = {
    getCart: async (userId: string) => {
        const response = await api.get<CartResponse>(`/cart/${userId}`);
        return response.data;
    },

    addItemToCart: async (userId: string, data: AddItemToCartRequest) => {
        const response = await api.post<CartResponse>(`/cart/${userId}`, data);
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
        const response = await api.patch<CartResponse>(`/cart/${userId}/restaurant/${restaurantId}/item/${productId}`, {
            quantity,
            ...(sizeId && { sizeId }),
            ...(customizations && { customizations }),
        });
        return response.data;
    },

    removeItemFromCart: async (
        userId: string,
        restaurantId: string,
        productId: string,
        sizeId?: string,
        customizations?: string,
    ) => {
        const params = new URLSearchParams();
        if (sizeId) params.append("sizeId", sizeId);
        if (customizations) params.append("customizations", customizations);
        const queryString = params.toString();
        const url = `/cart/${userId}/restaurant/${restaurantId}/item/${productId}${queryString ? `?${queryString}` : ""}`;
        const response = await api.delete<CartResponse>(url);
        return response.data;
    },

    clearRestaurant: async (userId: string, restaurantId: string) => {
        const response = await api.delete<CartResponse>(`/cart/${userId}/restaurant/${restaurantId}`);
        return response.data;
    },

    clearCart: async (userId: string) => {
        const response = await api.delete<CartResponse>(`/cart/${userId}`);
        return response.data;
    },
};
