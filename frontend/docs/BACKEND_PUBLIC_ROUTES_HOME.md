# API cần mở public (anonymous) cho trang Home & duyệt catalog

**Ngữ cảnh:** `GET` từ trình duyệt **không gửi JWT** khi user chưa đăng nhập. Gateway trả **401** thì frontend **không thể sửa** bằng cách đổi axios — cần cấu hình **backend / API Gateway** cho phép đọc catalog không xác thực.

Base URL phía frontend: `NEXT_PUBLIC_API_URL` (ví dụ `http://localhost:8080/api`).  
Các đường dẫn dưới đây là **suffix sau `/api`** (tức route đầy đủ: `{origin}/api/...`).

---

## Bắt buộc cho Home hiện tại (featured + filter)

| Method | Path | Gọi từ (frontend) |
|--------|------|-------------------|
| `GET` | `/products` | Query: `type`, `lat`, `lon`, `category`, `page`, `order`, … — `productApi.getAllProducts`, `FeaturedFoodPanel`, `HomeFoodList`, `RestaurantList` (tab foods) |
| `GET` | `/category` | `categoryApi.getAllCategories` và `restaurantApi.getAllCategories` (cùng path) — thanh category trên `/restaurants` |

---

## Nên mở public nếu Home / listing có tab nhà hàng

| Method | Path | Gọi từ (frontend) |
|--------|------|-------------------|
| `GET` | `/restaurant` | Query: `page`, `size`, `lat`, `lon`, `category`, … — `restaurantApi.getAllRestaurants` (`RestaurantList` khi `type=restaurants`) |

---

## Gợi ý thêm (duyệt không đăng nhập — trang chi tiết / xem món)

Nếu sau này user guest cần xem chi tiết mà không 401, backend nên cho phép **GET chỉ đọc** tương ứng (chỉ ví dụ — đúng controller tùy repo):

| Method | Path (ví dụ) | Mục đích |
|--------|----------------|----------|
| `GET` | `/products/{slug}` | Chi tiết món theo slug |
| `GET` | `/products/restaurant/{restaurantId}` | Món theo nhà hàng |
| `GET` | `/restaurant/{slug}` | Chi tiết nhà hàng theo slug |

---

## Không nên public

- `POST` / `PUT` / `DELETE` trên `products`, `category`, `restaurant`, …
- Các path admin / merchant (`/products/admin/...`, `/restaurant/admin/...`, …)

---

## Ghi chú cho team backend

- Chỉ cần **`permitAll()`** / **anonymous** cho các **`GET`** đọc catalog ở trên; vẫn giữ **JWT** cho thao tác ghi và khu vực merchant/admin.
- Sau khi mở route, guest sẽ nhận **200** + JSON; không cần chỉnh logic frontend để “giả” đăng nhập.
