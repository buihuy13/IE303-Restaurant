/**
 * Mock API layers have been removed; restaurant-service, user-service, product, and cart
 * calls always use the configured API gateway (`NEXT_PUBLIC_API_URL`).
 *
 * Kept as a stub so old imports of this module do not break.
 */
export const USE_MOCK = false;
export const USE_MOCK_PRODUCT = false;
export const USE_MOCK_RESTAURANT = false;
