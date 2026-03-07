# Frontend – kiến trúc & convention

Frontend được xây bằng **Next.js app router** với 3 “khu vực” chính:

- **Client (end-user)**: `app/(client)/**` + `components/client/**`
- **Merchant (chủ nhà hàng)**: `app/merchant/**` + `components/merchant/**`
- **Admin**: `app/(admin)/admin/**` + `components/admin/**` + `components/dashboard/**`

Dưới đây là những phần quan trọng để dev mới hiểu nhanh cách tổ chức code.

---

## 1. Cấu trúc thư mục chính

### 1.1. App router

```txt
app/
├─ (client)/
│  ├─ page.tsx                    # Trang home cho khách
│  ├─ search/page.tsx             # Tìm kiếm sản phẩm
│  ├─ blog/**                     # Blog cho user
│  ├─ account/**                  # Account, orders, settings
│  ├─ group-orders/**             # Group order
│  └─ chat/page.tsx               # Chat user
│
├─ merchant/
│  ├─ layout.tsx                  # Layout merchant (sidebar, header)
│  ├─ page.tsx                    # Dashboard tổng quan
│  ├─ orders/page.tsx             # Quản lý đơn hàng
│  ├─ food/page.tsx               # Quản lý món ăn
│  ├─ wallet/page.tsx             # Ví merchant
│  ├─ reports/page.tsx            # Reports/analytics
│  ├─ messages/page.tsx           # Chat merchant
│  └─ manage/
│     ├─ staff/page.tsx           # Nhân viên
│     └─ settings/page.tsx        # Cài đặt nhà hàng
│
├─ (admin)/
│  ├─ layout.tsx                  # Layout admin
│  └─ admin/
│     ├─ dashboard/page.tsx       # Dashboard admin
│     ├─ users/page.tsx           # User list
│     ├─ merchants/page.tsx       # Merchant list
│     ├─ restaurants/page.tsx     # Restaurants
│     ├─ orders/page.tsx          # (nếu có)
│     ├─ sizes/page.tsx           # Product sizes
│     ├─ categories/page.tsx      # Categories
│     ├─ promotions/page.tsx      # Promotions
│     ├─ merchant-requests/page.tsx # Duyệt merchant
│     └─ settings/page.tsx        # Cài đặt hệ thống
```

### 1.2. Components (theo “domain”)

- `components/client/**`: UI cho end-user (home, search, restaurants, cart, orders, account, blog, chat, payment, delivery, ...).
- `components/merchant/**`: UI và trang quản trị cho merchant (dashboard, orders, food, staff, settings, wallet, reports, messages, ...).
- `components/admin/**`: UI quản trị cho admin (dashboard, merchants, users, restaurants, settings, ...).
- `components/dashboard/**`: Các phần dùng chung cho dashboard (charts, cards, sections,...).
- `components/layout/**`, `components/header/**`, `components/providers/**`: Layout & shell chung.

---

## 2. Pattern quan trọng: Container + View

Trong toàn bộ `frontend/` team dùng pattern **container + view** để tách rõ logic và UI.

- **Container**  
  - Tên thường là `*PageClient.tsx` hoặc `*PageContainer.tsx`.  
  - Chỉ làm:
    - Gọi **hooks** (fetch API, socket, store, state, router, ...).  
    - Chuẩn hoá dữ liệu, tính toán derived state.  
    - Chuẩn bị callback handlers.  
    - Render **một** view/chùm view chính bằng cách truyền props.
  - Hạn chế viết JSX layout phức tạp ở đây.

- **View (UI thuần)**  
  - Tên thường là `*PageView.tsx` hoặc các component UI con (`*Header`, `*Table`, `*Card`, `*List`, ...).  
  - Chỉ nhận **props thuần** và render UI.  
  - **Không** gọi API, **không** truy cập store/global hooks, **không** điều hướng router trực tiếp (router nên ở container, truyền callback xuống nếu cần).

### 2.1. Ví dụ phía client

- `AccountSettingsPageClient` → `AccountSettingsPageView`
- `AccountOrdersPageClient` → `AccountOrdersPageView`
- `AccountAddressesPageClient` → `AccountAddressesPageView`
- `BlogPageClient` → `BlogPageView`
- `MyBlogsPageClient` → `MyBlogsPageView`
- `BlogDetailPageClient` → `BlogDetailPageView`
- `SearchPageClient` → `SearchPageView`
- `ChatPageClient` → `ChatPageView`
- `ContactPageClient` → `ContactPageView`

Các file `app/(client)/**/page.tsx` chỉ wrap lại `*PageClient`, ví dụ:

```tsx
"use client";

import SearchPageClient from "@/components/client/search/SearchPageClient";

export default function SearchPage() {
  return <SearchPageClient />;
}
```

### 2.2. Ví dụ phía merchant & admin

Merchant/Admin không luôn tạo file `*PageView` riêng, nhưng vẫn theo triết lý:

- **Container**:  
  - `MerchantDashboardPageClient`, `MerchantOrdersPageClient`, `FoodPageClient`,  
    `MerchantReportsPageClient`, `MerchantWalletPageClient`,  
    `MerchantsPageClient`, `UsersPageClient`, `AdminRestaurantsPageClient`, `DashboardPageClient`, ...
  - Các file này:
    - Gọi hooks domain (`useMerchantFoodData`, `useAdminDashboardData`, `useAdminMerchantsData`, ...).  
    - Tính toán filter, derived data, chuẩn bị handlers.  
    - Truyền xuống các view con.

- **View con**:  
  - `DashboardVisualization`, `DashboardRecentOrders`, `DashboardTopMerchants`  
  - `AdminRestaurantCard`, `RestaurantFormModal`  
  - `UsersTable`, `MerchantsTable`, `MerchantRequestsList`, `SizesTable`, `CategoriesTable`, ...  
  - Chỉ xử lý UI, không gọi API trực tiếp.

Khi thêm màn hình merchant/admin mới:

1. Tạo `SomethingPageClient.tsx` trong `components/merchant/**` hoặc `components/admin/**`.  
2. Cho file đó gọi hooks + chuẩn bị props.  
3. Render view con (`SomethingHeader`, `SomethingStats`, `SomethingTable`...), hoặc tạo thêm `SomethingPageView` nếu UI đủ lớn.  
4. Trong `app/merchant/.../page.tsx` hay `app/(admin)/admin/.../page.tsx` chỉ import `SomethingPageClient` và render.

---

## 3. Flow chung theo vai trò

### 3.1. Client (end-user)

- Home → chọn món → cart → payment → delivery tracking.
- Account: orders, group orders, addresses, settings password.
- Blog: list, detail, my-blogs, create/edit.
- Search: filter/sort sản phẩm, pagination.
- Chat: user ↔ merchant.

### 3.2. Merchant

- Dashboard: overview doanh thu, top sản phẩm, recent orders.
- Orders: quản lý đơn theo status (PENDING, PREPARING, READY, COMPLETED, ...).
- Food: quản lý món ăn (thêm/sửa/xoá).
- Reports: charts chi tiết (revenue trend, hourly, weekday, top products, ...).
- Wallet: số dư, rút tiền, history.
- Settings: cấu hình thông tin nhà hàng.
- Messages: chat với khách.

### 3.3. Admin

- Dashboard: tổng quan hệ thống.
- Users: quản lý user.
- Merchants: list merchant, status.
- Merchant requests: duyệt/ từ chối yêu cầu đăng ký merchant.
- Restaurants: list + bật/tắt + chỉnh sửa.
- Sizes / Categories / Promotions: cấu hình hệ thống.
- Messages: chat admin side.
- Settings: cài đặt admin.

---

## 4. Khi thêm màn hình mới

1. **Chọn domain**: client / merchant / admin.  
2. **Tạo route** trong `app/.../page.tsx` (chỉ wrap `*PageClient`).  
3. **Tạo container** `SomethingPageClient.tsx`:
   - Gọi hooks, state, router, store.  
   - Chuẩn bị props & handlers.  
4. **Tạo/ghép view**:
   - Nếu UI lớn: thêm `SomethingPageView.tsx`.  
   - Nếu chỉ reuse nhiều component con: render trực tiếp các `*Header`, `*Stats`, `*Table` trong container.

Tuân theo pattern này sẽ giúp:

- Dễ test logic (chỉ test container).  
- Dễ reuse UI (view thuần props).  
- Code ít “lẫn lộn” giữa business logic và giao diện.**

