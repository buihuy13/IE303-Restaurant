/**
 * Cấu hình dùng mock API.
 *
 * - Mặc định:
 *   - **productApi** và **restaurantApi**: luôn gọi backend thật.
 *   - Các API khác: **dùng mock** (không call backend thật).
 * - Nếu sau này muốn tắt mock cho các API còn lại, set:
 *   NEXT_PUBLIC_USE_MOCK="false"
 */

// Cờ dùng chung cho hầu hết API (userApi, categoryApi, cartApi, ...)
// Mặc định = true (dùng mock), chỉ khi NEXT_PUBLIC_USE_MOCK="false" mới tắt mock.
export const USE_MOCK =
    !(typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_USE_MOCK === "false");

// Hai cờ riêng cho productApi và restaurantApi
// Luôn là false để bắt buộc gọi backend thật, độc lập với USE_MOCK chung.
export const USE_MOCK_PRODUCT = false;
export const USE_MOCK_RESTAURANT = false;
