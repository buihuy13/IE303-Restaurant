# Hướng dẫn tích hợp Keycloak cho Frontend

Tài liệu này mô tả cách backend đang triển khai Keycloak và gợi ý các bước để frontend tích hợp đăng nhập.

**Keycloak hiện hỗ trợ đăng nhập bằng:** email (hoặc username) + mật khẩu, Google, Facebook. Chi tiết ở mục 1.5.

**Tài liệu chi tiết flow frontend đã triển khai:** `frontend/docs/KEYCLOAK_FRONTEND_FLOW.md`

---

## 0. Trạng thái triển khai (frontend)

- **Đã triển khai Option A (Authorization Code + PKCE)** cho luồng đăng nhập ở `app/(auth)`.
- **Trang login mới** (`/login`) chỉ làm nhiệm vụ điều hướng sang Keycloak:
  - Continue with Keycloak
  - Continue with Google (`kc_idp_hint=google`)
  - Continue with Facebook (`kc_idp_hint=facebook`)
- **Callback route** dùng `app/(auth)/login-success/page.tsx` để nhận `code/state` và đổi token.
- **Token refresh** được gọi trực tiếp về Keycloak bằng `refresh_token`.
- **Logout** gọi end-session endpoint của Keycloak rồi quay về frontend.

---

## 1. Tổng quan backend hiện tại

### 1.1. Keycloak đã được cấu hình

- **Realm**: `restaurant-realm`
- **Client cho frontend**: `restaurant-frontend` (public client)
- **Redirect URIs**: `http://localhost:3000/*`, `http://localhost:8080/*`
- **Web Origins**: `+` (cho phép tất cả)

### 1.2. Các flow được bật

| Flow | Enabled | Mô tả |
|------|---------|-------|
| **Standard Flow** (Authorization Code) | ✅ | Redirect user sang Keycloak login page |
| **Direct Access Grants** (Resource Owner Password) | ✅ | Gửi username/password trực tiếp lấy token |
| **Implicit Flow** | ❌ | Không dùng (không an toàn) |

### 1.3. API Gateway

- **Xác thực**: JWT từ Keycloak (OAuth2 Resource Server)
- **Issuer URI**: `JWT_ISSUER_URI` (vd: `http://localhost:9090/realms/restaurant-realm`)
- **Roles**: Lấy từ `realm_access.roles` trong JWT (KeycloakRoleConverter)
- **Roles**: `ADMIN`, `USER`, `MERCHANT`

### 1.4. User Service

- **Register**: `POST /api/users/register` → tạo user trong Keycloak + DB
- **Email verification**: Bật (`verifyEmail: true`)
- **Social login**: Google, Facebook đã config trong Identity Providers

### 1.5. Các cách đăng nhập trên Keycloak (đã có sẵn)

Trên **màn hình login của Keycloak** (khi dùng Authorization Code – redirect sang Keycloak), user sẽ thấy:

| Cách đăng nhập | Cấu hình trong realm | Ghi chú |
|----------------|----------------------|--------|
| **Email (hoặc username) + mật khẩu** | `loginWithEmailAllowed: true` | Form mặc định: nhập email/username + password (user đăng ký qua `/register` hoặc admin tạo). |
| **Đăng nhập bằng Google** | `identityProviders` → `google` (enabled) | Nút "Login with Google" trên trang Keycloak. Cần điền `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` trong realm/Keycloak Admin. |
| **Đăng nhập bằng Facebook** | `identityProviders` → `facebook` (enabled) | Nút "Login with Facebook". Cần điền `FACEBOOK_CLIENT_ID` và `FACEBOOK_CLIENT_SECRET`. |

- **Email/password**: Luôn có (form mặc định Keycloak).
- **Google / Facebook**: Đã khai báo trong `realm.json`; nếu đã cấu hình client ID/secret thật trong Keycloak Admin thì nút tương ứng sẽ hiện trên trang login.

---

## 2. Các hướng triển khai cho Frontend

### 2.1. Option A: Authorization Code Flow (Khuyến nghị cho SPA)

**Flow**: User click "Đăng nhập" → redirect sang Keycloak → **trên trang Keycloak user chọn**: đăng nhập bằng **email + mật khẩu** hoặc **Google** hoặc **Facebook** → sau khi login thành công redirect về frontend với `code` → frontend exchange code lấy token.

**Ưu điểm**:
- Không gửi password qua frontend (khi dùng email/password thì password chỉ gửi tới Keycloak)
- Phù hợp với OAuth2/OIDC chuẩn
- **Một trang login có đủ**: form email/password + nút Google + nút Facebook (theo cấu hình realm ở mục 1.5)

**Đã triển khai trong code hiện tại**:
1. Frontend tạo `state` + PKCE (`code_verifier` / `code_challenge`) trước khi redirect.
2. Redirect tới Keycloak auth endpoint (có thể kèm `kc_idp_hint`).
3. Callback `/login-success` nhận `code/state` và exchange qua token endpoint.
4. Lưu `access_token`, `refresh_token`, `id_token` ở client store.
5. Axios tự gắn `Authorization: Bearer <access_token>`.
6. Khi `401`, axios dùng `refresh_token` để lấy access token mới từ Keycloak.

**Keycloak URLs** (dev):
- Base: `http://localhost:9090`
- Realm: `restaurant-realm`
- Token endpoint: `http://localhost:9090/realms/restaurant-realm/protocol/openid-connect/token`
- Auth endpoint: `http://localhost:9090/realms/restaurant-realm/protocol/openid-connect/auth`

---

### 2.2. Option B: Direct Access Grants (Resource Owner Password)

**Flow**: User nhập username/password → frontend gọi Keycloak token endpoint → nhận access_token.

**Ưu điểm**:
- Đơn giản, không cần redirect
- Giữ được UX form login hiện tại

**Nhược điểm**:
- Password đi qua frontend (cần HTTPS)
- OAuth2 khuyến nghị tránh dùng cho public client

**Cần thực hiện**:
1. Cấu hình Keycloak client `restaurant-frontend` (đã có `directAccessGrantsEnabled: true`)
2. Gọi `POST` tới Keycloak token endpoint với `grant_type=password`, `username`, `password`, `client_id`
3. Public client không cần `client_secret`
4. Lưu `access_token` và dùng trong API calls

---

### 2.3. Option C: Backend BFF (Backend for Frontend)

**Flow**: Frontend gửi username/password tới backend → backend gọi Keycloak token endpoint → nhận token → trả về cho frontend.

**Ưu điểm**:
- Password không qua frontend
- Backend có thể sync user với DB, thêm logic custom

**Cần thực hiện**:
1. Backend thêm endpoint `POST /api/auth/login` (hoặc tương tự)
2. Backend nhận username/password, gọi Keycloak token endpoint, trả về `access_token`
3. Frontend chỉ cần gọi API login như hiện tại → nhận token

**Lưu ý**: Backend hiện chưa có endpoint login. Cần thêm service/controller mới.

---

## 3. Cấu trúc JWT từ Keycloak

JWT access token có dạng:

```json
{
  "sub": "user-uuid-in-keycloak",
  "realm_access": {
    "roles": ["USER", "offline_access"]
  },
  "email": "user@example.com",
  "preferred_username": "username",
  "exp": 1234567890,
  "iat": 1234567890
}
```

- **sub**: Keycloak user ID (UUID)
- **realm_access.roles**: Danh sách roles (ADMIN, USER, MERCHANT)
- **preferred_username**: Username
- **email**: Email (nếu có)

**API Gateway** đọc `realm_access.roles` và map thành `ROLE_USER`, `ROLE_ADMIN`, `ROLE_MERCHANT` cho Spring Security.

---

## 4. Đồng bộ User với User Service DB

- **Register**: User đăng ký qua `POST /api/users/register` → tạo trong Keycloak + DB
- **Login**: User đăng nhập qua Keycloak → nhận JWT với `sub` = Keycloak user ID
- **Vấn đề**: User Service DB dùng `id` (UUID) từ Keycloak. Cần đảm bảo endpoint `/users/accesstoken` hoặc tương tự nhận JWT, trích `sub` và trả về user từ DB.

**Nếu backend chưa có endpoint lấy user từ token**:
- Cần thêm endpoint nhận `Authorization: Bearer <token>`, lấy `sub` từ JWT, query user theo `id = sub`, trả về user profile.

---

## 5. Gợi ý thứ tự làm trước

1. **Đọc tài liệu Keycloak**:
   - [Keycloak JavaScript Adapter](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter)
   - [OIDC Authorization Code Flow](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth)

2. **Xác định flow**:
   - Nếu muốn giữ form login hiện tại → Option B hoặc C
   - Nếu muốn chuẩn OAuth2 → Option A

3. **Kiểm tra backend**:
   - Endpoint `/api/users/login` có tồn tại không? (hiện tại user-service chỉ có `/register`)
   - Endpoint `/api/users/accesstoken` có tồn tại không? (để lấy user profile từ token)
   - Nếu chưa có → cần backend thêm hoặc frontend dùng Keycloak token + decode JWT để lấy thông tin cơ bản

4. **Cấu hình environment**:
   - `NEXT_PUBLIC_KEYCLOAK_BASE_URL`: `http://localhost:9090` (hoặc URL Keycloak thực tế)
   - `NEXT_PUBLIC_KEYCLOAK_REALM`: `restaurant-realm`
   - `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`: `restaurant-frontend`

5. **Thư viện gợi ý**:
   - `keycloak-js`: Adapter chính thức từ Keycloak
   - `@react-keycloak/web`: React wrapper cho keycloak-js

---

## 6. Tài liệu tham khảo

- [Keycloak Securing Applications](https://www.keycloak.org/docs/latest/securing_apps/)
- [Keycloak JavaScript Adapter](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter)
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)

---

## 7. Cấu hình hiện tại (realm.json)

```json
{
  "realm": "restaurant-realm",
  "clients": [
    {
      "clientId": "restaurant-frontend",
      "publicClient": true,
      "standardFlowEnabled": true,
      "directAccessGrantsEnabled": true,
      "rootUrl": "http://localhost:3000",
      "redirectUris": ["http://localhost:3000/*", "http://localhost:8080/*"],
      "webOrigins": ["+"]
    }
  ]
}
```

---

## 8. Checklist kiểm thử sau khi migrate Option A

1. Mở `/login` và bấm **Continue with Keycloak**:
   - Bị redirect sang trang login Keycloak.
   - Login thành công quay về `/login-success` rồi chuyển tiếp vào app.
2. Mở `/login` và bấm **Continue with Google/Facebook**:
   - Keycloak chuyển sang provider tương ứng.
   - Đăng nhập xong quay lại app như flow thường.
3. Gọi API cần auth:
   - Request có `Authorization: Bearer <access_token>`.
4. Chờ access token hết hạn:
   - Request đầu tiên có thể `401`.
   - Axios tự refresh token với Keycloak và retry thành công.
5. Bấm logout từ menu user:
   - Session local bị xóa.
   - Frontend redirect qua Keycloak logout endpoint.
   - Quay về trang đã cấu hình (`/` hoặc `/login`).
