/**
 * Cấu hình dùng mock API.
 *
 * - Mặc định: **dùng mock** (không call backend thật) để phù hợp với giai đoạn chưa có API.
 * - Nếu sau này có backend thật và muốn bật lại call API, set:
 *   NEXT_PUBLIC_USE_MOCK=false
 */
export const USE_MOCK =
    typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_USE_MOCK === "false" ? false : true;

