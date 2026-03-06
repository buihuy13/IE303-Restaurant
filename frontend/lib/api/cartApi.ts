import api from "../axios";
import { USE_MOCK } from "../config/mockRuntime";

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
    // Get user's cart
    getCart: async (userId: string) => {
        if (USE_MOCK) {
            const emptyCart: CartResponse = {
                status: "success",
                message: "Mock cart (empty)",
                data: {
                    userId,
                    restaurants: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            };
            return emptyCart;
        }
        const response = await api.get<CartResponse>(`/cart/${userId}`);
        return response.data;
    },

    // Add item to cart
    addItemToCart: async (userId: string, data: AddItemToCartRequest) => {
        if (USE_MOCK) {
            const restaurantCart: RestaurantCart = {
                restaurantId: data.restaurant.restaurantId,
                restaurantName: data.restaurant.restaurantName,
                items: [
                    {
                        ...data.item,
                        subtotal: data.item.price * data.item.quantity,
                    },
                ],
                subtotal: data.item.price * data.item.quantity,
                tax: 0,
                deliveryFee: 0,
                discount: 0,
                totalAmount: data.item.price * data.item.quantity,
            };
            const mockResponse: CartResponse = {
                status: "success",
                message: "Item added to mock cart",
                data: {
                    userId,
                    restaurants: [restaurantCart],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            };
            return mockResponse;
        }
        const response = await api.post<CartResponse>(`/cart/${userId}`, data);
        return response.data;
    },

    // Update item quantity
    updateItemQuantity: async (
        userId: string,
        restaurantId: string,
        productId: string,
        quantity: number,
        sizeId?: string,
        customizations?: string
    ) => {
        if (USE_MOCK) {
            const mockResponse: CartResponse = {
                status: "success",
                message: "Mock quantity updated",
                data: null,
            };
            return mockResponse;
        }
        const response = await api.patch<CartResponse>(`/cart/${userId}/restaurant/${restaurantId}/item/${productId}`, {
            quantity,
            ...(sizeId && { sizeId }),
            ...(customizations && { customizations }),
        });
        return response.data;
    },

    // Remove item from cart
    removeItemFromCart: async (
        userId: string,
        restaurantId: string,
        productId: string,
        sizeId?: string,
        customizations?: string
    ) => {
        if (USE_MOCK) {
            const mockResponse: CartResponse = {
                status: "success",
                message: "Mock item removed",
                data: null,
            };
            return mockResponse;
        }
        const params = new URLSearchParams();
        if (sizeId) params.append("sizeId", sizeId);
        if (customizations) params.append("customizations", customizations);
        const queryString = params.toString();
        const url = `/cart/${userId}/restaurant/${restaurantId}/item/${productId}${queryString ? `?${queryString}` : ""}`;
        const response = await api.delete<CartResponse>(url);
        return response.data;
    },

    // Clear restaurant from cart
    clearRestaurant: async (userId: string, restaurantId: string) => {
        if (USE_MOCK) {
            const mockResponse: CartResponse = {
                status: "success",
                message: "Mock restaurant cleared",
                data: null,
            };
            return mockResponse;
        }
        const response = await api.delete<CartResponse>(`/cart/${userId}/restaurant/${restaurantId}`);
        return response.data;
    },

    // Clear entire cart
    clearCart: async (userId: string) => {
        if (USE_MOCK) {
            const mockResponse: CartResponse = {
                status: "success",
                message: "Mock cart cleared",
                data: null,
            };
            return mockResponse;
        }
        const response = await api.delete<CartResponse>(`/cart/${userId}`);
        return response.data;
    },
};
