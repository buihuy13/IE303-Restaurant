## Test case Frontend cho `restaurant-service` & `user-service`

Tài liệu này liệt kê **các test case chức năng phía frontend** để kiểm tra integration với:

- `restaurant-service` (qua `restaurantApi`, các màn search/list nhà hàng và trang restaurant-detail)
- `user-service` (qua `userApi` và các page `account`)

Các test case giả định:

- Backend đã chạy ổn (`api-gateway`, `restaurant-service`, `user-service`).
- Keycloak login hoạt động, user đã login bằng role `USER` hoặc `ADMIN`/`MERCHANT` tương ứng.

---

## 1. Test `restaurant-service`

### 1.0. Flow search tổng quát (theo yêu cầu)

- **Luồng mong muốn:**
  - User gõ từ khóa ở ô search (header) hoặc vào trang `/search`.
  - Kết quả hiển thị là **các món ăn (food) thuộc từng nhà hàng**.
  - Khi **bấm vào món ăn** (từ suggestions hoặc từ grid kết quả search):
    - Nếu đang ở trang search/home → **đi đến trang chi tiết nhà hàng** (`/restaurants/[slug]`).
    - Tại trang nhà hàng, user mới **chọn món** để vào trang chi tiết món ăn (`/food/[slug]`).
  - Khi **bấm vào kết quả là nhà hàng** → đi thẳng tới `/restaurants/[slug]`.

### 1.1. Danh sách nhà hàng – `GET /restaurant`

- **TC-R-01 – Tải danh sách nhà hàng mặc định**
  - **Bước**:
    1. Thực hiện thao tác **search / chọn khu vực / action bất kỳ** trên UI dẫn tới màn hình list nhà hàng (component `RestaurantsContainer`, route nội bộ `/(client)/restaurants`).
       - Lưu ý: Có thể **không có link đi thẳng `/restaurants` trong UI**, khi test dev có thể gõ URL trực tiếp chỉ để debug.
  - **Kỳ vọng**:
    - Gửi request `GET /restaurant` với query mặc định.
    - Hiển thị **danh sách nhà hàng** (card/grid).
    - Không lỗi toast / không redirect về error page.

- **TC-R-02 – Phân trang / filter**
  - **Bước**:
    1. Ở màn hình list nhà hàng (nơi hiển thị `RestaurantsContainer`), thao tác:
       - Chọn category filter.
       - Chuyển trang (next/prev).
    2. Quan sát network.
  - **Kỳ vọng**:
    - Request `GET /restaurant` được gửi lại với query params đúng (page, size, cate, …).
    - UI cập nhật theo dữ liệu backend trả về.

- **TC-R-03 – Empty state**
  - **Chuẩn bị**: Backend trả về `content` rỗng cho query cụ thể (vd: filter không có kết quả).
  - **Bước**:
    1. Chọn filter hiếm (hoặc cấu hình backend).
  - **Kỳ vọng**:
    - Frontend hiển thị **empty state** rõ ràng (không crash, không loading vô hạn).

### 1.2. Chi tiết nhà hàng – `GET /restaurant/{slug}`

- **TC-R-10 – Xem chi tiết nhà hàng hợp lệ**
  - **Bước**:
    1. Từ kết quả search / danh sách nhà hàng (hoặc từ nơi hiển thị danh sách món ăn thuộc một nhà hàng), bấm vào nhà hàng để vào trang chi tiết (restaurant-detail) `/(client)/restaurants/[slug]`.
  - **Kỳ vọng**:
    - Gửi request `GET /restaurant/{slug}` (slug đã encode đúng).
    - Trang hiển thị đúng:
      - Tên, địa chỉ, giờ mở cửa, rating, số review.
      - Menu sản phẩm, tabs, reviews.

- **TC-R-11 – Slug có ký tự encode**
  - **Chuẩn bị**: Một restaurant có slug chứa ký tự đặc biệt (vd: khoảng trắng, Unicode).
  - **Bước**:
    1. Điều hướng đến `/restaurants/[slug]` tương ứng.
  - **Kỳ vọng**:
    - Code decode/encode slug hoạt động: không bị 404 do encode sai.
    - Backend nhận đúng slug và trả dữ liệu.

- **TC-R-12 – Nhà hàng không tồn tại**
  - **Chuẩn bị**: Dùng slug không tồn tại hoặc backend trả 404.
  - **Bước**:
    1. Truy cập trực tiếp `/restaurants/some-invalid-slug`.
  - **Kỳ vọng**:
    - Frontend xử lý lỗi:
      - Chuyển sang `restaurants/not-found` **hoặc** hiển thị thông báo hợp lý.
      - Không kẹt loading.

### 1.3. Admin – quản lý nhà hàng

(Role yêu cầu: `ADMIN`, sử dụng page `/(admin)/admin/restaurants` và `restaurantApi` admin endpoints.)

- **TC-R-20 – Lấy chi tiết nhà hàng theo ID (admin)**
  - **Bước**:
    1. Đăng nhập bằng tài khoản `ADMIN`.
    2. Mở trang `/admin/restaurants`.
    3. Chọn một nhà hàng để xem/chỉnh sửa.
  - **Kỳ vọng**:
    - Gửi request `GET /restaurant/admin/{restaurantId}`.
    - Form chi tiết load đúng thông tin.

- **TC-R-21 – Tạo nhà hàng mới – `POST /restaurant`**
  - **Bước**:
    1. Đăng nhập `ADMIN` hoặc `MERCHANT` (tuỳ policy).
    2. Ở trang quản lý restaurants, mở form **Create restaurant**.
    3. Nhập đầy đủ `resName`, `address`, `openingTime`, `closingTime`, `phone`, `merchantId`, … chọn image.
    4. Submit.
  - **Kỳ vọng**:
    - Frontend gửi `POST /restaurant` với body dạng `FormData`:
      - Field `restaurant`: JSON Blob (type `application/json`).
      - Field `image`: file upload (nếu chọn).
    - Backend tạo thành công:
      - Hiển thị toast success.
      - Danh sách được refresh, có record mới.

- **TC-R-22 – Validation form tạo nhà hàng**
  - **Bước**:
    1. Mở form **Create restaurant**.
    2. Bỏ trống các field bắt buộc hoặc nhập sai format (vd: giờ).
    3. Submit.
  - **Kỳ vọng**:
    - Frontend hiển thị lỗi validation (client-side).
    - Không call API nếu form không hợp lệ.

- **TC-R-23 – Cập nhật nhà hàng – `PUT /restaurant/{id}`**
  - **Bước**:
    1. Ở trang admin restaurants, chọn một nhà hàng.
    2. Chỉnh sửa thông tin (vd: tên, giờ mở cửa).
    3. Submit.
  - **Kỳ vọng**:
    - Gửi `PUT /restaurant/{id}` với `FormData` tương tự create.
    - UI hiển thị dữ liệu mới sau khi backend trả về.

- **TC-R-24 – Bật/tắt trạng thái nhà hàng – `PUT /restaurant/enable/{id}`**
  - **Bước**:
    1. Tại danh sách restaurants admin, click nút toggle enable/disable cho một nhà hàng.
  - **Kỳ vọng**:
    - Gửi `PUT /restaurant/enable/{id}`.
    - Trạng thái `enabled` cập nhật trên UI (badge màu, text).

- **TC-R-25 – Xoá nhà hàng – `DELETE /restaurant/{id}`**
  - **Bước**:
    1. Tại list restaurants, chọn **Delete** một nhà hàng.
    2. Xác nhận trong modal.
  - **Kỳ vọng**:
    - Gửi `DELETE /restaurant/{id}`.
    - Record biến mất khỏi danh sách (hoặc đánh dấu đã xoá).

- **TC-R-26 – Xoá ảnh nhà hàng – `DELETE /restaurant/image/{id}`**
  - **Bước**:
    1. Trong màn hình edit restaurant, chọn chức năng **Remove image**.
  - **Kỳ vọng**:
    - Gửi `DELETE /restaurant/image/{id}`.
    - Ảnh biến mất, hiển thị placeholder mặc định.

### 1.4. Category & Review (liên quan restaurant)

- **TC-R-30 – Lấy tất cả category – `GET /category`**
  - **Bước**:
    1. Mở màn hình lọc nhà hàng hoặc form tạo/ sửa restaurant.
  - **Kỳ vọng**:
    - Gửi `GET /category`.
    - Dropdown category hiển thị đúng danh sách.

- **TC-R-31 – Lấy reviews của nhà hàng – `GET /review?resId={id}`**
  - **Bước**:
    1. Vào trang chi tiết nhà hàng.
    2. Cuộn tới phần reviews.
  - **Kỳ vọng**:
    - Gửi `GET /review?resId={restaurantId}`.
    - Danh sách review hiển thị đúng (nếu có).
    - Empty state nếu chưa có review.

---

## 2. Test `user-service`

Các chức năng chính dùng `userApi`:

- Thông tin profile user.
- Đổi mật khẩu (qua Keycloak account page).
- Quản lý địa chỉ giao hàng.

### 2.1. Thông tin profile – `GET /api/users/accesstoken`, `GET /api/users/admin/{id}` & `PUT /api/users/{id}`

- **TC-U-01 – Load thông tin user sau login**
  - **Bước**:
    1. Login thành công bằng user bình thường (`USER`).
    2. Truy cập `/(client)/account` (`/account`).
  - **Kỳ vọng**:
    - Frontend đọc userId (từ store/JWT).
    - Gửi request lấy thông tin user (tùy flow, có thể qua gateway → user-service).
    - UI hiển thị username, email, avatar… đúng với dữ liệu backend.

- **TC-U-02 – Admin xem thông tin user bất kỳ – `GET /api/users/admin/{id}`**
  - **Bước**:
    1. Đăng nhập bằng tài khoản `ADMIN`.
    2. Mở trang quản lý users (trong khu vực `/admin/users` nếu có).
    3. Chọn 1 user để xem chi tiết.
  - **Kỳ vọng**:
    - Gửi `GET /api/users/admin/{id}`.
    - Hiển thị đầy đủ thông tin user.

- **TC-U-03 – Cập nhật profile – `PUT /api/users/{id}`**
  - **Bước**:
    1. Tại trang `/account/settings` (hoặc tab Profile), sửa dữ liệu: username, phone, avatar, …
    2. Submit.
  - **Kỳ vọng**:
    - Gửi `PUT /api/users/{id}` với body là dữ liệu profile (`username`, `phone`).
    - Nếu backend trả 200:
      - Toast success hiển thị.
      - UI cập nhật theo dữ liệu mới.

- **TC-U-04 – Validation cập nhật profile**
  - **Bước**:
    1. Nhập email không hợp lệ, hoặc để trống field bắt buộc (nếu FE validate).
    2. Submit.
  - **Kỳ vọng**:
    - FE chặn submit, hiển thị message lỗi tương ứng.

### 2.2. Đổi mật khẩu – điều hướng Keycloak (không gọi endpoint `user-service`)

- **TC-U-10 – Điều hướng tới trang đổi mật khẩu Keycloak**
  - **Bước**:
    1. Tại trang `/account/settings`, tab Security/Password.
    2. Nhập `newPassword` và `confirmPassword`.
    3. Submit form.
  - **Kỳ vọng**:
    - Frontend validate dữ liệu cơ bản (mật khẩu khớp nhau, đủ độ dài).
    - Frontend redirect sang Keycloak account security page.
    - Không gọi endpoint đổi mật khẩu trong `user-service`.

- **TC-U-11 – Validation mật khẩu không hợp lệ ở frontend**
  - **Bước**:
    1. Nhập mật khẩu mới và confirm không khớp (hoặc < 6 ký tự).
    2. Submit form.
  - **Kỳ vọng**:
    - Frontend hiển thị lỗi rõ ràng.
    - Không redirect Keycloak khi dữ liệu không hợp lệ.

### 2.3. Địa chỉ giao hàng – `/api/users/addresses/{userId}`, `/api/users/address`, `/api/users/address/{addressId}`

- **TC-U-20 – Load danh sách địa chỉ – `GET /api/users/addresses/{userId}`**
  - **Bước**:
    1. Truy cập `/account/addresses`.
  - **Kỳ vọng**:
    - Gửi `GET /api/users/addresses/{userId}`.
    - Hiển thị list address (street, city, state, zipCode, country, isDefault).

- **TC-U-21 – Thêm địa chỉ mới – `POST /api/users/address`**
  - **Bước**:
    1. Tại `/account/addresses`, bấm **Add address**.
    2. Nhập đầy đủ địa chỉ và chọn suggestion để có tọa độ (`location`, `longitude`, `latitude`).
    3. Submit.
  - **Kỳ vọng**:
    - Gửi `POST /api/users/address` với body chứa `userId` + dữ liệu địa chỉ.
    - Backend trả về address mới (có `id`, `location`, `longitude`, `latitude`).
    - List được refresh, address mới hiển thị.

- **TC-U-22 – Xóa địa chỉ – `DELETE /api/users/address/{addressId}`**
  - **Bước**:
    1. Ở `/account/addresses`, chọn một địa chỉ.
    2. Bấm **Delete** và confirm.
  - **Kỳ vọng**:
    - Gửi `DELETE /api/users/address/{addressId}`.
    - Địa chỉ biến mất khỏi UI.

- **TC-U-23 – Đồng bộ danh sách địa chỉ sau thêm/xóa**
  - **Chuẩn bị**: User có nhiều địa chỉ.
  - **Bước**:
    1. Vào `/account/addresses`, thêm một địa chỉ mới.
    2. Xóa một địa chỉ đang có.
  - **Kỳ vọng**:
    - Danh sách địa chỉ cập nhật đúng sau mỗi thao tác.
    - FE sync đúng với backend sau refresh trang.

---

## 3. Test lỗi & bảo mật (chung cho cả 2 service)

- **TC-S-01 – Gọi API khi chưa login**
  - **Bước**:
    1. Đảm bảo user **chưa login** (clear localStorage, logout).
    2. Truy cập màn search / list nhà hàng, `/account`, `/account/addresses`, `/admin/restaurants` tùy case.
  - **Kỳ vọng**:
    - Các route yêu cầu auth:
      - Bị redirect về trang login hoặc hiển thị thông báo không có quyền.
    - Request đến backend bị chặn (401/403), FE xử lý gọn, không crash.

- **TC-S-02 – Token hết hạn (liên quan Keycloak + services)**
  - **Bước**:
    1. Login bình thường.
    2. Chờ token gần hết hạn (hoặc chỉnh env cho expiry ngắn để test).
    3. Thực hiện thao tác gọi API từ `restaurant-service`/`user-service` (vd: load restaurants, update profile).
  - **Kỳ vọng**:
    - Nếu request đầu tiên dính 401:
      - Axios interceptor gọi refresh token.
      - Request được retry thành công, UI hoạt động như bình thường.
    - Nếu refresh fail:
      - FE clear session, chuyển về trạng thái guest (có thể redirect login).

- **TC-S-03 – Truy cập API admin bằng user thường**
  - **Bước**:
    1. Login với role `USER` (không phải `ADMIN`).
    2. Cố gắng truy cập màn `/admin/restaurants` hoặc hành vi gọi admin API.
  - **Kỳ vọng**:
    - FE chặn route (ProtectedRoute) **hoặc** backend trả 403.
    - Không hiển thị UI quản trị nếu không có quyền.

