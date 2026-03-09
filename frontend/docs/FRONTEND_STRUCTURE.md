# Cấu trúc thư mục Frontend – Mô tả chi tiết

Tài liệu này mô tả **cấu trúc thư mục** của project frontend (Next.js App Router) để các thành viên team nắm rõ từng thư mục/file dùng để làm gì.

---

## 1. Tổng quan

- **Framework**: Next.js 15 (App Router), React 19
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS v4, PostCSS
- **State**: Zustand (stores), React hooks
- **HTTP**: Axios (instance có refresh token, base URL theo môi trường)
- **Build**: Turbopack (dev & build)

Ba “khu vực” chính:

| Khu vực   | Route gốc        | Mô tả ngắn                          |
|-----------|------------------|-------------------------------------|
| **Client**   | `/(client)/*`    | Người dùng cuối: mua hàng, blog, tài khoản, chat |
| **Merchant** | `/merchant/*`    | Chủ nhà hàng: quản lý món, đơn, ví, báo cáo      |
| **Admin**    | `/admin/*`       | Quản trị hệ thống: users, merchants, restaurants, cấu hình |

---

## 2. Cấu trúc thư mục gốc (`frontend/`)

```
frontend/
├── app/                    # Next.js App Router – routes & layouts
├── assets/                 # Hình ảnh, SVG tĩnh (import trong code)
├── components/             # React components (UI + logic container)
├── constants/              # Hằng số dùng chung (icons, images paths)
├── docs/                   # Tài liệu nội bộ (Keycloak, cấu trúc, …)
├── hooks/                  # Custom hooks theo domain (admin, client, merchant)
├── lib/                    # API client, axios, utils, config, adapters
├── mock-data/              # Dữ liệu mock (categories, products, users, restaurants)
├── public/                 # File tĩnh phục vụ tại gốc URL (favicon, placeholder)
├── stores/                 # Zustand stores (auth, cart, chat, location, …)
├── types/                  # TypeScript types/interfaces theo domain
├── .env.local              # Biến môi trường local (không commit)
├── .gitignore
├── components.json         # Cấu hình shadcn/ui (nếu dùng)
├── eslint.config.mjs
├── next.config.ts         # Cấu hình Next.js (images, experimental, compiler)
├── package.json
├── postcss.config.mjs
├── tsconfig.json          # TypeScript, path alias @/* → ./
├── next-env.d.ts
├── react-date-range.d.ts  # Type cho thư viện react-date-range
├── third-party.d.ts       # Khai báo type cho thư viện bên thứ ba
└── README.md              # Kiến trúc & convention (pattern Container + View)
```

---

## 3. Thư mục `app/` – Routes & layouts

Đây là **App Router** của Next.js. Mỗi `page.tsx` tương ứng một URL. Các thư mục trong ngoặc `(…)` là **route groups** (không ảnh hưởng URL).

### 3.1. Layout gốc & client wrapper

| File / thư mục | Mô tả |
|----------------|--------|
| `app/layout.tsx` | Root layout: font (Manrope, Roboto Serif), `<ClientLayout>`, `<CustomToaster>` |
| `app/ClientLayout.tsx` | Layout phía client: `AuthProvider`, Header/Footer (ẩn trên admin/merchant/auth), `ChatProvider`, `SSEProvider`, `useCartSync` |
| `app/globals.css` | CSS toàn cục, biến Tailwind |
| `app/loading.tsx` | UI loading toàn cục |
| `app/not-found.tsx` | Trang 404 |
| `app/favicon.ico` | Favicon |

### 3.2. `app/(admin)/` – Khu vực Admin

| Đường dẫn | Mô tả |
|-----------|--------|
| `(admin)/layout.tsx` | Layout admin (sidebar, shell) |
| `(admin)/admin/page.tsx` | Trang chủ admin |
| `(admin)/admin/dashboard/page.tsx` | Dashboard tổng quan |
| `(admin)/admin/users/page.tsx` | Quản lý user |
| `(admin)/admin/merchants/page.tsx` | Quản lý merchant |
| `(admin)/admin/merchant-requests/page.tsx` | Duyệt/từ chối yêu cầu đăng ký merchant |
| `(admin)/admin/restaurants/page.tsx` | Quản lý nhà hàng |
| `(admin)/admin/orders/page.tsx` | Quản lý đơn hàng |
| `(admin)/admin/categories/page.tsx` | Quản lý danh mục |
| `(admin)/admin/sizes/page.tsx` | Quản lý size sản phẩm |
| `(admin)/admin/promotions/page.tsx` | Quản lý khuyến mãi |
| `(admin)/admin/messages/page.tsx` | Tin nhắn (admin) |
| `(admin)/admin/settings/page.tsx` | Cài đặt hệ thống |
| `(admin)/admin/types/types.ts` | Types dùng riêng trong admin |

### 3.3. `app/(auth)/` – Đăng nhập, đăng ký, xác thực

| Đường dẫn | Mô tả |
|-----------|--------|
| `(auth)/login/page.tsx` | Đăng nhập |
| `(auth)/login-success/page.tsx` | Callback xử lý Keycloak `code/state` rồi redirect theo role |
| `(auth)/register/page.tsx` | Đăng ký |
| `(auth)/verify-email/page.tsx` | Xác thực email |
| `(auth)/confirm/page.tsx` | Xác nhận (vd: confirm token) |
| `(auth)/(twofa)/2fa/setup/page.tsx` | Thiết lập 2FA |
| `(auth)/(twofa)/2fa/verify/page.tsx` | Xác minh 2FA |

### 3.4. `app/(client)/` – Khu vực người dùng cuối (Client)

| Đường dẫn | Mô tả |
|-----------|--------|
| `(client)/page.tsx` | Trang chủ |
| `(client)/about/page.tsx` | Giới thiệu |
| `(client)/contact/page.tsx` | Liên hệ |
| `(client)/FAQ/page.tsx` | FAQ |
| `(client)/search/page.tsx` | Tìm kiếm sản phẩm |
| `(client)/restaurants/page.tsx` | Danh sách nhà hàng |
| `(client)/restaurants/[slug]/page.tsx` | Chi tiết nhà hàng |
| `(client)/restaurants/not-found.tsx` | Not found nhà hàng |
| `(client)/food/[slug]/page.tsx` | Chi tiết món ăn |
| `(client)/food/not-found.tsx` | Not found món ăn |
| `(client)/cart/page.tsx` | Giỏ hàng |
| `(client)/payment/page.tsx` | Thanh toán |
| `(client)/orders/page.tsx` | Danh sách đơn hàng |
| `(client)/orders/[slug]/page.tsx` | Chi tiết đơn hàng |
| `(client)/orders/not-found.tsx` | Not found đơn |
| `(client)/delivery/[slug]/page.tsx` | Theo dõi giao hàng |
| `(client)/delivery/not-found.tsx` | Not found delivery |
| `(client)/account/page.tsx` | Tổng quan tài khoản |
| `(client)/account/layout.tsx` | Layout khu vực account |
| `(client)/account/template.tsx` | Template account |
| `(client)/account/orders/page.tsx` | Đơn hàng của tôi |
| `(client)/account/addresses/page.tsx` | Sổ địa chỉ |
| `(client)/account/settings/page.tsx` | Cài đặt tài khoản (đổi mật khẩu, …) |
| `(client)/blog/page.tsx` | Danh sách blog |
| `(client)/blog/[slug]/page.tsx` | Chi tiết blog |
| `(client)/blog/create/page.tsx` | Tạo blog |
| `(client)/blog/edit/[id]/page.tsx` | Sửa blog |
| `(client)/blog/my-blogs/page.tsx` | Blog của tôi |
| `(client)/group-orders/[shareToken]/page.tsx` | Trang group order (theo token) |
| `(client)/group-orders/[shareToken]/join/page.tsx` | Tham gia group order |
| `(client)/chat/page.tsx` | Chat |
| `(client)/under-development/page.tsx` | Trang “đang phát triển” |

### 3.5. `app/merchant/` – Khu vực Merchant

| Đường dẫn | Mô tả |
|-----------|--------|
| `merchant/layout.tsx` | Layout merchant (sidebar, shell) |
| `merchant/page.tsx` | Dashboard merchant |
| `merchant/register/page.tsx` | Đăng ký merchant |
| `merchant/orders/page.tsx` | Quản lý đơn hàng |
| `merchant/food/page.tsx` | Quản lý món ăn |
| `merchant/food/new/page.tsx` | Thêm món |
| `merchant/food/edit/[id]/page.tsx` | Sửa món |
| `merchant/wallet/page.tsx` | Ví merchant |
| `merchant/reports/page.tsx` | Báo cáo / analytics |
| `merchant/messages/page.tsx` | Tin nhắn merchant |
| `merchant/manage/staff/page.tsx` | Quản lý nhân viên |
| `merchant/manage/settings/page.tsx` | Cài đặt nhà hàng |

### 3.6. Trang đặc biệt (ngoài nhóm)

| Đường dẫn | Mô tả |
|-----------|--------|
| `app/coming-soon/page.tsx` | Trang “sắp ra mắt” |

---

## 4. Thư mục `components/`

Components được tổ chức theo **domain** (admin, client, merchant) và **chức năng chung** (ui, layout, header, providers).

### 4.1. `components/admin/` – UI dành cho Admin

- **Chung**: `Header.tsx`, `Sidebar.tsx`, `ThemeProvider.tsx`, `AdminNotificationBell.tsx`
- **categories**: Header, List, Table, Search, FormModal, PageClient
- **merchant-requests**: Header, List, Card, Search, Stats, RejectModal, PageClient
- **merchants**: Header, Table, Filters, Stats, PageClient
- **messages**: Header, PageClient
- **orders**: OrderList, OrdersTable, OrdersMobileList, OrdersSearchBar
- **products**: ProductFormModal, ProductsList
- **promotions**: Header, Table, Filters, Stats, PageClient
- **restaurants**: AdminRestaurantCard, Filters, Header, List, RestaurantFormModal, PageClient
- **settings**: Header, PageClient, SectionCard, Appearance, General, Language, Notifications, Security
- **sizes**: Header, List, Table, Search, SizeFormModal, PageClient
- **users**: Header, Table, Filters, UserFormModal, UserList, PageClient

### 4.2. `components/client/` – UI dành cho Client (end-user)

- **about**: AboutHero, ContentSection, StatsBanner
- **account**: AccountBanner, AccountSidebar, AccountPageClient/View, EditProfileModal, AccountRecentActivity, AccountStatsGrid  
  - **account/addresses**: PageClient/View, Header, List, AddForm  
  - **account/orders**: PageClient/View, Header, List, ListItem, EmptyState, Loading  
  - **account/settings**: PageClient/View, Header, SecuritySection, PasswordForm, Loading
- **animations**: ScrollReveal
- **blog**: BlogPageClient/View, BlogList*, BlogDetail*, BlogCreate*, BlogEdit*, MyBlogs*, RelatedBlogs, BlogComments, …
- **cart**: CartPageContainer, CartItemRow, OrderSummary
- **chat**: ChatPageClient/View, ChatClient, ChatList, ChatWindow
- **Coming-soon**: CountdownTimer
- **contact**: ContactPageClient/View, ContactHero, ContactForm
- **Delivery**: DeliveryStatusPageClientWrapper, PageContainer, OrderStatusSidebar, StatusBadge
- **FAQ**: FaqAccordion
- **Food**: FoodDetail
- **group-orders**: (các component cho group order)
- **OrderDetail**: OrderDetailClientWrapper, OrderDetailContainer, OrderSummary, ReviewForm
- **Orders**: OrdersPageClient/Container, OrderHistorySidebar, OrderItemRow, OrderTrackingTimeline, OrderSkeleton, PeopleAlsoBought, ProductSugestionCard
- **Payment**: PaymentPageContainer, PaymentProgress, PaymentMethodSelector, StripeCardElement, FormInput, InputField, RadioField, SelectField
- **Restaurant**: RestaurantHero, RestaurantInfo, RestaurantMenu/MenuWrapper, RestaurantNavTabs, RestaurantReviews, ReviewCard, MenuItemCard, RestaurantActions, RestaurantBreadcrumb, ChatWithRestaurantButton, CreateGroupOrderModal
- **restaurants**: RestaurantsContainer, RestaurantList, RestaurantCard/CardSkeleton, FoodCard/FoodCardSkeleton, FilterSection, FilterSidebar
- **search**: SearchPageClient/View, SearchFilters, SearchResultsHeader, SearchSortBar, SearchEmptyState, FilterSection
- **Pagination.tsx**, **Button.tsx**

### 4.3. `components/merchant/` – UI dành cho Merchant

- **Chung**: MerchantSidebar, MerchantNotificationBell, ConfirmDeleteRestaurantModal
- **dashboard**: MerchantDashboardPageClient
- **food**: FoodPageClient, FoodPageHeader, FoodCard, FoodForm, FoodFormModal, FoodSearch, FoodStats, FoodPageEmptyState, ConfirmDeleteFoodModal
- **manage/settings**: MerchantSettingsPageClient
- **manage/staff**: StaffManagementPageClient
- **messages**: MerchantMessagesPageClient
- **orders**: MerchantOrdersPageClient
- **register**: MerchantRegisterPageClient
- **reports**: MerchantReportsPageClient
- **reviews**: RatingChart, RatingDashboard
- **setting**: SettingCard
- **wallet**: MerchantWalletPageClient

### 4.4. `components/dashboard/` – Dùng chung cho Dashboard (Admin/Merchant)

- DashboardHeader, DashboardPageClient
- DashboardOrderStatusSection, DashboardPaymentStatusSection
- DashboardRecentOrders, DashboardRevenueBreakdown, DashboardTopMerchants
- DashboardVisualization, MerchantCharts, RevenueTrendChart
- SectionDateFilter, StatsCard, StatusBreakdown

### 4.5. `components/header/` – Header dùng cho client

- Header, Logo, NavigationLinks, NavActions
- SearchBar, AddressSelector, CartDropdown, FloatingDropdown, MobileMenu, NotificationDropdown

### 4.6. `components/layout/client/`

- **Footer.tsx**, **Header.tsx** (layout client)

### 4.7. `components/auth/`

- **AuthProvider.tsx** – Bọc app, quản lý trạng thái đăng nhập
- **LoadingScreen.tsx** – Màn hình loading khi check auth
- **ProtectedRoute.tsx** – Bảo vệ route theo quyền

### 4.8. `components/providers/`

- **ChatProvider.tsx** – Context/hook cho chat
- **SSEProvider.tsx** – Server-Sent Events (thông báo realtime)

### 4.9. `components/ui/` – UI cơ bản / dùng lại

- accordion, Badge, Button, card, dialog, dropdown-menu
- **ConfirmModal.tsx**, **CustomToaster.tsx**, **GlobalLoader.tsx**

### 4.10. Component lẻ (gốc `components/`)

- **AddressAutocomplete.tsx** – Autocomplete địa chỉ
- **Button.tsx** – Nút dùng chung

---

## 5. Thư mục `hooks/`

Custom hooks được nhóm theo **domain**, tách logic khỏi component.

### 5.1. `hooks/admin/`

- **categories**: useAdminCategoriesData, useAdminCategoryActions, useAdminCategoryFilters, useAdminCategoryModal
- **dashboard**: useAdminDashboardData
- **merchant-requests**: useMerchantRequestsData, useMerchantRequestActions, useMerchantRequestSearch, useMerchantRequestRejectModal
- **merchants**: useAdminMerchantsData, useAdminMerchantActions, useAdminMerchantFilters
- **orders**: useAdminOrderSearch, useAdminOrderActions, useAdminOrderStatusDraft
- **restaurants**: useAdminRestaurantsData, useAdminRestaurantActions/Filters/Modal/Owners
- **sizes**: useAdminSizesData, useAdminSizeActions/Filters/Modal
- **users**: useAdminUsersData, useAdminUserActions, useAdminUserFilters

### 5.2. `hooks/client/`

- **account**: useAccountProfile, useAccountOrdersList, useAccountOrdersAndStats, useAccountAddressesList, useAccountAddressForm, useAccountAddressDelete, useAccountPasswordUpdate
- **blog**: useBlogListData, useBlogListFeatured, useBlogListFilters, useBlogDetailData, useBlogDetailLike, useBlogDetailShare, useBlogDetailTags, useBlogCreateForm, useBlogEditForm, useMyBlogsData, useMyBlogsFilters, useMyBlogsActions, useEditorToolbarImageOverride
- **chat**: useChatRooms
- **contact**: useContactForm
- **group-orders**: useGroupOrderData, useGroupOrderActions, useGroupOrderPermissions, useGroupOrderProductImage, useJoinGroupOrderPage
- **search**: useSearchProducts, useSearchFilteredProducts, useSearchLocation

### 5.3. `hooks/common/`

- **useMounted.ts** – Hook kiểm tra component đã mount (tránh hydrate mismatch)

### 5.4. `hooks/merchant/`

- **food**: useMerchantFoodData, useMerchantFoodFilters

---

## 6. Thư mục `lib/`

Chứa **API client**, **cấu hình**, **utils**, **adapters**.

### 6.1. `lib/api/` – Gọi backend theo resource

- **authApi.ts** – Đăng nhập, refresh, logout
- **blogApi.ts**
- **cartApi.ts**
- **categoryApi.ts**
- **chatApi.ts**
- **dashboardApi.ts**
- **groupOrderApi.ts**
- **merchantApi.ts**
- **orderApi.ts**
- **paymentApi.ts**
- **productApi.ts**
- **restaurantApi.ts**
- **reviewApi.ts**
- **sizeApi.ts**
- **userApi.ts**
- **walletApi.ts**

### 6.2. `lib/` (file gốc)

- **axios.ts** – Instance Axios: baseURL (API_URL / API_INTERNAL_URL), withCredentials, interceptors (refresh token, attach token)
- **jwt.ts** – Parse/kiểm tra JWT
- **formatters.ts** – Format số, ngày, tiền tệ
- **utils.ts** – Hàm tiện ích chung
- **userLocation.ts** – Logic vị trí user
- **checkoutSelection.ts** – Logic chọn option checkout

### 6.3. `lib/config/`

- **publicRuntime.ts** – Biến public (vd: `NEXT_PUBLIC_*`, `API_URL`)
- **mockRuntime.ts** – Config cho mock

### 6.4. `lib/constants/`

- **blog.ts** – Hằng số liên quan blog

### 6.5. `lib/hooks/`

- **useCartSync.ts** – Đồng bộ giỏ hàng với auth
- **useChatSocket.ts** – Kết nối socket chat
- **useLocationWithFallback.ts**
- **useMerchantRestaurant.ts**
- **useNotifications.ts**
- **useOrderSocket.ts** / **useOrderWebSocket.ts**
- **useSSE.ts**
- **useWebSocket.ts**

### 6.6. `lib/utils/`

- **chatUtils.ts**
- **dashboardFormat.ts**
- **managerCredentials.ts**
- **redirectUtils.ts**

### 6.7. `lib/adapters/`

- **dashboardAdapters.ts** – Chuyển đổi dữ liệu API dashboard sang format dùng trong UI

---

## 7. Thư mục `stores/` (Zustand)

| File | Mô tả |
|------|--------|
| **useAuthStore.ts** | Trạng thái đăng nhập, user, token |
| **cartStore.ts** | Giỏ hàng |
| **categoryStore.ts** | Danh mục (cache phía client) |
| **sizeStore.ts** | Size sản phẩm (cache) |
| **useChatStore.ts** | Trạng thái chat (phòng, tin nhắn) |
| **useLocationStore.ts** | Vị trí người dùng |
| **useMerchantOrderStore.ts** | Đơn hàng merchant (realtime) |
| **useNotificationStore.ts** | Thông báo |
| **useProductsStores.ts** | State sản phẩm (filter, list) |
| **useRestaurantStore.ts** | Thông tin nhà hàng đang xem |

---

## 8. Thư mục `types/`

Định nghĩa TypeScript theo từng domain. File **index.ts** thường re-export để import gọn.

- **blog.type.ts**, **category.type.ts**, **chat.type.ts**, **contact.type.ts**
- **dashboard.type.ts**, **groupOrder.type.ts**, **order.type.ts**
- **payment.type.ts**, **product.type.ts**, **restaurant.type.ts**
- **review.type.ts**, **size.type.ts**, **user.type.ts**, **wallet.type.ts**
- **index.ts**

---

## 9. Thư mục `constants/`

- **icons/index.ts** – Export icon (lucide-react, react-icons, …)
- **images/index.ts** – Đường dẫn/URL ảnh dùng chung
- **index.ts** – Re-export

---

## 10. Thư mục `assets/`

Ảnh/SVG tĩnh import trực tiếp trong code (không qua `public/`):

- **About/** – chef, delivery, ourmission, ourstory
- **Common/** – Logo, ảnh mẫu
- **HomePage/** – hero, burger, noodles, pizza, leaf, partner, …
- **Restaurant/** – Burger
- **SocialIcons/** – Facebook, Instagram, Linkedin, Twitter

---

## 11. Thư mục `public/`

File tĩnh phục vụ tại gốc URL (vd: `/file.svg`, `/placeholder.png`):

- **file.svg**, **globe.svg**, **next.svg**, **vercel.svg**, **window.svg**
- **placeholder.png**, **placeholder-banner.png**

---

## 12. Thư mục `mock-data/`

Dữ liệu mock dùng khi dev hoặc fallback:

- **categories.ts**
- **products.ts**
- **restaurants.ts**
- **users.ts**

---

## 13. Thư mục `docs/`

Tài liệu nội bộ frontend:

- **KEYCLOAK_INTEGRATION.md** – Tích hợp Keycloak (auth, realm, flow)
- **FRONTEND_STRUCTURE.md** – Tài liệu này (cấu trúc thư mục)

---

## 14. Alias TypeScript

Trong `tsconfig.json`: **`@/*`** → **`./*`** (gốc là `frontend/`).

Ví dụ: `@/components/ui/Button`, `@/lib/axios`, `@/stores/useAuthStore`, `@/types`.

---

## 15. Gợi ý khi thêm tính năng mới

1. **Route**: Thêm `app/.../page.tsx` tương ứng (client / admin / merchant).
2. **Container**: Tạo `*PageClient.tsx` (hoặc `*PageContainer.tsx`) trong `components/<domain>/`, gọi hooks và truyền props xuống view.
3. **View**: Tạo `*PageView.tsx` hoặc các component con (`*Header`, `*Table`, …) chỉ nhận props, không gọi API/store trực tiếp.
4. **Hook**: Nếu logic phức tạp, tách vào `hooks/<domain>/useXxx.ts`.
5. **API**: Thêm hàm trong `lib/api/xxxApi.ts` nếu có endpoint mới.
6. **Type**: Thêm/chuẩn hóa type trong `types/xxx.type.ts`.

Chi tiết pattern **Container + View** và convention đặt tên xem **README.md** ở gốc `frontend/`.
