import { authApi } from "./authApi";

/**
 * User-service is exposed through the API gateway under `/users/*`.
 * The app uses `authApi` everywhere; this export is an alias for compatibility.
 */
export const userApi = authApi;
