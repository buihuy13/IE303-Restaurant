/**
 * User-service (`UserController` → `/api/users/**` on the gateway → `/users/**` with `NEXT_PUBLIC_API_URL`).
 *
 * Implemented by {@link authApi} (shared axios instance, Keycloak refresh). Prefer importing `authApi`
 * for new code; `userApi` is the same object for backward compatibility.
 *
 * Covered endpoints:
 * - GET/POST `/users`, GET `/users/admin/{id}`, GET `/users/{slug}`, GET `/users/accesstoken`
 * - PUT/DELETE `/users/{id}`, POST `/users/register`
 * - POST `/users/address`, DELETE `/users/address/{id}`, GET `/users/addresses/{id}`
 */
export { authApi as userApi } from "./authApi";
