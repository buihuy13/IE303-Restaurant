/**
 * Client-facing API routes (via gateway `/api`). Source of truth: backend controllers + api-gateway routes.
 * Admin/merchant mutations omitted unless used on shared flows.
 */

export const CLIENT_QUERY = {
    restaurants: "GET /query/restaurants",
    restaurantById: "GET /query/restaurants/{id}",
    products: "GET /query/products",
} as const;

export const CLIENT_RESTAURANT = {
    bySlug: "GET /restaurant/{slug}",
    byAdminId: "GET /restaurant/admin/{id}",
    byMerchantId: "GET /restaurant/merchant/{merchantId}",
    categories: "GET /catalog/category",
    reviews: "GET /review/restaurant/{id}",
    reviewStats: "GET /review/stats/restaurant/{id}", // hero + aggregates
} as const;

export const CLIENT_PRODUCT = {
    byId: "GET /products/{id}", // admin / legacy
    bySlug: "GET /products/slug/{slug}", // public detail
    byRestaurant: "GET /products/restaurant/{restaurantId}",
    sizes: "GET /products/productsize/{productId}",
    restaurantByProduct: "GET /products/res/{productId}",
    reviews: "GET /review/product/{id}",
    reviewStats: "GET /review/stats/product/{id}",
} as const;

export const CLIENT_CATALOG = {
    categories: "GET /catalog/category",
    sizes: "GET /catalog/size",
} as const;

export const CLIENT_CART_ORDER = {
    cart: "GET|POST|PUT|DELETE /cart",
    checkout: "POST /order/checkout",
    orders: "GET /order",
    orderById: "GET /order/{id}",
    cancel: "PUT /order/{id}/cancel",
} as const;

export const CLIENT_AUTH_REQUIRED = {
    imagesUpload: "POST /images/upload",
    reviewCreate: "POST /review",
} as const;
