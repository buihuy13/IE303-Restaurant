# Keycloak Frontend Flow (Chi tiết triển khai)

Tài liệu này giải thích chi tiết cách frontend đang triển khai Keycloak Authorization Code Flow với PKCE.

## 1) Câu hỏi quan trọng: đây có phải “mặc định setup Keycloak” không?

Không hoàn toàn.

- **Phần chuẩn theo OIDC/Keycloak** (mặc định theo spec):
  - Gọi `/protocol/openid-connect/auth` để bắt đầu login.
  - Gọi `/protocol/openid-connect/token` để đổi `code` lấy token.
  - Dùng `grant_type=refresh_token` để refresh access token.
  - Gọi `/protocol/openid-connect/logout` để logout SSO.
  - Dùng `state` và PKCE (`code_verifier`, `code_challenge`).
- **Phần custom của dự án** (do frontend tự thiết kế):
  - Lưu transaction trong `sessionStorage` với key `keycloak_auth_transaction`.
  - Callback route cố định là `/login-success`.
  - Lưu token vào store + `localStorage`.
  - Cách redirect theo role (`USER`, `MERCHANT`, `ADMIN`).
  - Cách axios tự refresh và retry request.

Nói ngắn gọn: **protocol là chuẩn Keycloak/OIDC**, còn **cách tổ chức code/state là của dự án**.

---

## 2) File chính và vai trò

- `frontend/lib/auth/keycloak.ts`
  - Chứa logic OIDC/PKCE mức thấp.
- `frontend/stores/useAuthStore.ts`
  - Quản lý state đăng nhập toàn app.
- `frontend/app/(auth)/login/page.tsx`
  - Nút bắt đầu flow login.
- `frontend/app/(auth)/login-success/page.tsx`
  - Xử lý callback `code/state`.
- `frontend/lib/axios.ts`
  - Gắn Bearer token, refresh khi `401`.
- `frontend/lib/config/publicRuntime.ts`
  - Đọc env Keycloak runtime.

---

## 3) Environment bắt buộc

Thiết lập trong `.env.local`:

- `NEXT_PUBLIC_KEYCLOAK_BASE_URL=http://localhost:9090`
- `NEXT_PUBLIC_KEYCLOAK_REALM=restaurant-realm`
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=restaurant-frontend`

Điểm cần khớp với Keycloak Admin:

1. Realm đúng tên.
2. Client đúng `clientId`.
3. Client là **public client**.
4. Redirect URI chứa `http://localhost:3000/login-success`.

---

## 4) Luồng đăng nhập đầy đủ

### Bước 1: User bấm Sign in

Từ `login/page.tsx`, gọi `loginWithKeycloak()` trong store.

### Bước 2: Tạo transaction + PKCE

Trong `startKeycloakLogin()`:

1. Tạo `state` random.
2. Tạo `code_verifier` random.
3. Tạo `code_challenge = BASE64URL(SHA256(code_verifier))`.
4. Lưu `{ state, codeVerifier, redirectPath }` vào `sessionStorage`.
5. Redirect browser tới auth endpoint Keycloak.

### Bước 3: User login ở Keycloak

- User có thể login bằng email/password hoặc social provider.
- Nếu bấm Google/Facebook từ frontend thì thêm `kc_idp_hint`.

### Bước 4: Keycloak callback về frontend

Keycloak redirect về:

- `/login-success?code=...&state=...`

### Bước 5: Exchange code lấy token

Trong `exchangeCodeForTokens()`:

1. Đọc transaction từ `sessionStorage`.
2. So sánh `state` callback với `state` đã lưu (CSRF protection).
3. Gọi token endpoint với:
   - `grant_type=authorization_code`
   - `client_id`
   - `code`
   - `redirect_uri`
   - `code_verifier`
4. Nhận `access_token`, `refresh_token`, `id_token`.

### Bước 6: Đồng bộ profile và vào app

Trong `completeKeycloakLogin()`:

1. Lưu tokens vào store/localStorage.
2. Gọi API profile để lấy user domain.
3. Redirect theo role/callback path.

---

## 5) Refresh token và retry request

Trong `axios` interceptor:

1. Request luôn gắn `Authorization: Bearer <accessToken>` nếu có.
2. Nếu nhận `401`:
   - Lấy `refreshToken` từ localStorage.
   - Gọi `refreshKeycloakToken()` để lấy access token mới.
   - Update store.
   - Retry request cũ.
3. Nếu refresh fail:
   - Xóa session local.
   - logout về guest.

---

## 6) Logout chuẩn Keycloak SSO

Trong `logout({ redirectToKeycloak: true })`:

1. Clear local tokens/state.
2. Build URL logout:
   - `client_id`
   - `post_logout_redirect_uri`
   - `id_token_hint` (nếu có)
3. `window.location.assign(logoutUrl)`.

Ý nghĩa: logout không chỉ ở app, mà còn logout tại phiên SSO của Keycloak.

---

## 7) Vì sao không dùng `keycloak-js`?

Hiện tại dự án dùng cách tự triển khai fetch-based để:

- Chủ động control state/store hiện có.
- Dễ tích hợp interceptor hiện tại.
- Không phụ thuộc lifecycle của adapter.

Vẫn đúng chuẩn OIDC nếu các bước auth/token/refresh/logout tuân thủ spec như trên.

---

## 8) Lỗi thường gặp và cách kiểm tra

1. **`Invalid login state`**
   - Do mất `sessionStorage` transaction hoặc callback state mismatch.
   - Kiểm tra browser chặn storage hoặc mở nhiều tab.

2. **`Failed to exchange authorization code`**
   - Sai `redirect_uri`, `realm`, `client_id`, hoặc code hết hạn.
   - Kiểm tra config client ở Keycloak Admin.

3. **Không thấy nút Google/Facebook trên login Keycloak**
   - IdP chưa enable hoặc thiếu client ID/secret provider.

4. **Refresh thất bại liên tục**
   - Refresh token hết hạn hoặc không được cấp.
   - Kiểm tra token lifespan và session settings trong realm.

---

## 9) Tóm tắt bảo mật

- Có `state` chống CSRF.
- Có PKCE cho public client.
- Không dùng implicit flow.
- Chỉ chấp nhận redirect path nội bộ (`/...`) để tránh open redirect.

---

## 10) Tham khảo nhanh endpoint

Với `baseUrl=http://localhost:9090`, `realm=restaurant-realm`:

- Auth: `http://localhost:9090/realms/restaurant-realm/protocol/openid-connect/auth`
- Token: `http://localhost:9090/realms/restaurant-realm/protocol/openid-connect/token`
- Logout: `http://localhost:9090/realms/restaurant-realm/protocol/openid-connect/logout`
