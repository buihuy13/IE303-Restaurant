# Payment Payout Flow Với PayOS

Tài liệu này giải thích phần payout/wallet đã được thêm trong branch `feat-new-payment-flow`, mục đích là để các thành viên trong nhóm hiểu rõ scope đã sửa, cách flow hoạt động, cách test và những phần nên hoàn thiện tiếp.

## 1. Mục tiêu

Trước thay đổi này, project đã có flow nhận tiền qua PayOS cho đơn hàng, nhưng chưa có backend wallet/payout hoàn chỉnh cho merchant. Flow mới bổ sung:

- Merchant được cộng doanh thu vào wallet khi order đã `PAID` và chuyển sang `COMPLETED`.
- Merchant quản lý bank account nhận tiền.
- Merchant tạo withdrawal request.
- Admin approve/reject withdrawal request.
- Admin gom các request đã approve thành payout batch.
- `payment-service` gọi PayOS Payout API khi live payout được bật.
- Local/dev mặc định chạy `PAYOUT_DRY_RUN=true` để demo an toàn, không chuyển tiền thật.

## 2. Scope Đã Implement

### 2.1 Common + order-service

Các file chính:

- `backend/Common/src/main/java/com/CNTTK18/Common/Event/MerchantRevenueContract.java`
- `backend/Common/src/main/java/com/CNTTK18/Common/Event/MerchantRevenueEvent.java`
- `backend/order-service/src/main/java/com/CNTTK18/order_service/messaging/MerchantRevenuePublisher.java`
- `backend/order-service/src/main/java/com/CNTTK18/order_service/service/impl/OrderServiceImpl.java`

Implementation:

- Thêm event contract `MerchantRevenueContract`.
- Thêm event payload `MerchantRevenueEvent` gồm:
  - `orderId`
  - `merchantId`
  - `restaurantId`
  - `amount`
  - `completedAt`
  - `idempotencyKey`
- Thêm `merchantId` vào `Order` và `OrderResponse`.
- Khi checkout, `order-service` lấy `merchantId` từ `restaurant-service` và lưu snapshot vào order.
- Khi merchant/admin update order status sang `COMPLETED`, service chỉ publish revenue event nếu:
  - trạng thái cũ chưa phải `COMPLETED`
  - `paymentStatus == PAID`
- Nếu order cũ chưa có `merchantId`, service fallback gọi `restaurant-service` để resolve merchant owner.

Lý do:

- Wallet chỉ được cộng tiền khi đơn đã thanh toán và hoàn tất.
- Có `idempotencyKey` để `payment-service` không cộng tiền hai lần nếu RabbitMQ retry event.

### 2.2 payment-service: Wallet + Payout Backend

Các file chính:

- `backend/payment-service/src/main/java/com/CNTTK18/paymentservice/controller/WalletController.java`
- `backend/payment-service/src/main/java/com/CNTTK18/paymentservice/service/WalletService.java`
- `backend/payment-service/src/main/java/com/CNTTK18/paymentservice/service/Impl/WalletServiceImpl.java`
- `backend/payment-service/src/main/java/com/CNTTK18/paymentservice/service/MerchantRevenueConsumer.java`
- `backend/payment-service/src/main/java/com/CNTTK18/paymentservice/model/*`
- `backend/payment-service/src/main/java/com/CNTTK18/paymentservice/repository/*`
- `backend/payment-service/scripts/init-payment-db.sql`
- `backend/seed-db/payment_service.sql`

Các bảng mới:

- `merchant_wallets`
- `merchant_bank_accounts`
- `wallet_transactions`
- `payout_requests`
- `payout_batches`

Quan hệ dữ liệu chính trong `payment-service`:

| Bảng | Mục đích | Quan hệ quan trọng |
| --- | --- | --- |
| `merchant_wallets` | Lưu số dư của merchant | `merchant_id` unique, có thể snapshot `restaurant_id` |
| `merchant_bank_accounts` | Lưu tài khoản ngân hàng nhận payout của merchant | Thuộc `merchant_id`, soft delete bằng `is_active` |
| `wallet_transactions` | Audit tiền vào/ra wallet | Thuộc `wallet_id`, idempotency bằng `reference_key` |
| `payout_requests` | Request rút tiền do merchant tạo | Thuộc `wallet_id`, snapshot bank info, link `wallet_transaction_id` |
| `payout_batches` | Batch admin dùng để process PayOS payout | Một batch có nhiều `payout_requests` qua `payout_batch_id` |

Schema Docker đang dùng file `backend/seed-db/payment_service.sql`. File `backend/payment-service/scripts/init-payment-db.sql` chỉ là script local/manual và cần giữ đồng bộ với seed-db khi payment schema thay đổi.

Luồng credit doanh thu:

1. `payment-service` consume `MerchantRevenueEvent`.
2. Tìm wallet theo `merchantId`, nếu chưa có thì tạo mới.
3. Kiểm tra `referenceKey/idempotencyKey`.
4. Nếu event chưa từng xử lý:
   - tăng `availableBalance`
   - tăng `totalEarned`
   - tạo `wallet_transactions` type `EARN`, status `COMPLETED`

Luồng withdraw:

1. Merchant gọi `POST /api/wallets/withdraw`.
2. Backend kiểm tra:
   - amount > 0
   - bank account thuộc merchant
   - `availableBalance` đủ tiền
3. Backend reserve tiền:
   - giảm `availableBalance`
   - tăng `pendingWithdrawal`
4. Tạo:
   - `payout_requests` status `PENDING`
   - `wallet_transactions` type `WITHDRAW`, status `PENDING`, amount âm

Luồng admin approve/reject:

- Approve:
  - `PENDING` -> `APPROVED`
  - tiền vẫn nằm ở `pendingWithdrawal`
- Reject:
  - `PENDING`/`APPROVED`/`FAILED` -> `REJECTED`
  - hoàn tiền về `availableBalance`
  - giảm `pendingWithdrawal`
  - mark withdraw transaction `REJECTED`

Luồng payout batch:

1. Admin chọn các request status `APPROVED`.
2. Gọi `POST /api/admin/wallets/payout-batches`.
3. Backend tạo `payout_batches` status `PROCESSING`.
4. Nếu `PAYOUT_DRY_RUN=true`:
   - không gọi PayOS
   - mark batch `COMPLETED`
   - mark request `COMPLETED`
   - mark transaction `COMPLETED`
   - giảm `pendingWithdrawal`
   - tăng `totalWithdrawn`
5. Nếu live payout:
   - kiểm tra `PAYOS_PAYOUT_ENABLED=true`
   - kiểm tra đủ PayOS payout credentials
   - gọi `payOSPayout.payouts().batch().create(...)`
   - nếu thành công thì complete batch/request/transaction
   - nếu lỗi thì batch/request/transaction thành `FAILED`, tiền vẫn giữ ở `pendingWithdrawal` để admin retry hoặc reject

### 2.3 PayOS Payout Config

Các env mới:

```env
PAYOS_PAYOUT_CLIENT_ID=
PAYOS_PAYOUT_API_KEY=
PAYOS_PAYOUT_CHECKSUM_KEY=
PAYOS_PAYOUT_ENABLED=false
PAYOUT_DRY_RUN=true
```

Rule hiện tại:

- Local/dev: giữ `PAYOUT_DRY_RUN=true`.
- Demo live hoặc test chuyển tiền thật:
  - `PAYOS_PAYOUT_ENABLED=true`
  - `PAYOUT_DRY_RUN=false`
  - điền đủ 3 payout credentials.
- Nếu live payout bật nhưng thiếu credentials, backend trả lỗi rõ ràng thay vì silently fail.

### 2.4 api-gateway

Các file chính:

- `backend/api-gateway/src/main/resources/application.yml`
- `backend/api-gateway/src/main/java/com/CNTTK18/api_gateway/config/SecurityConfig.java`

Route mới:

- `/api/wallets/**` -> `payment-service`
- `/api/admin/wallets/**` -> `payment-service`

Security:

- `/api/wallets/**`: role `MERCHANT`
- `/api/admin/wallets/**`: role `ADMIN`

### 2.5 Frontend

Các file chính:

- `frontend/types/wallet.type.ts`
- `frontend/lib/api/walletApi.ts`
- `frontend/components/merchant/wallet/MerchantWalletPageClient.tsx`
- `frontend/app/(admin)/admin/wallet/page.tsx`
- `frontend/components/admin/wallet/AdminPayoutPageClient.tsx`
- `frontend/components/admin/Sidebar.tsx`

Merchant wallet page:

- Hiển thị:
  - available balance
  - pending withdrawal
  - total earned
  - total withdrawn
- Merchant có thể:
  - thêm/sửa/xóa bank account
  - set default bank account
  - tạo withdrawal request
  - xem transaction history

Admin payout page:

- URL: `/admin/wallet`
- Admin có thể:
  - xem payout requests
  - filter theo status
  - approve request
  - reject request
  - retry request `FAILED`
  - chọn nhiều request `APPROVED` để process batch
  - xem PayOS payout account balance hoặc badge `DRY RUN`

## 3. API Cần Biết

Merchant APIs:

- `GET /api/wallets`
- `GET /api/wallets/transactions?page=&limit=`
- `GET /api/wallets/bank-accounts`
- `POST /api/wallets/bank-accounts`
- `PUT /api/wallets/bank-accounts/{id}`
- `DELETE /api/wallets/bank-accounts/{id}`
- `POST /api/wallets/withdraw`

Admin APIs:

- `GET /api/admin/wallets/payout-requests?status=&merchantId=&from=&to=&page=&limit=`
- `POST /api/admin/wallets/payout-requests/{id}/approve`
- `POST /api/admin/wallets/payout-requests/{id}/reject`
- `POST /api/admin/wallets/payout-requests/{id}/retry`
- `POST /api/admin/wallets/payout-batches`
- `GET /api/admin/wallets/payout-account/balance`

## 4. Status Model

`WalletTransactionType`:

- `EARN`
- `WITHDRAW`

`WalletTransactionStatus`:

- `PENDING`
- `COMPLETED`
- `REJECTED`
- `FAILED`

`PayoutRequestStatus`:

- `PENDING`: merchant vừa tạo request, chờ admin duyệt
- `APPROVED`: admin đã duyệt, chờ gom batch
- `PROCESSING`: đang xử lý batch payout
- `COMPLETED`: payout hoàn tất
- `REJECTED`: admin từ chối, tiền được hoàn về available balance
- `FAILED`: PayOS payout lỗi, tiền vẫn ở pending withdrawal

`PayoutBatchStatus`:

- `PROCESSING`
- `COMPLETED`
- `FAILED`

## 5. Cách Test Backend

### 5.1 Automated checks nên chạy

```bash
cd backend
./gradlew :payment-service:compileJava :payment-service:test
./gradlew :payment-service:spotlessCheck
```

Frontend:

```bash
cd frontend
npm run lint -- --quiet
npx tsc --noEmit
npm run build
```

### 5.2 Manual backend test flow

Chuẩn bị:

1. Nếu chạy Docker init DB từ đầu, schema chính nằm ở `backend/seed-db/payment_service.sql`.
2. Nếu chạy riêng payment-service local, có thể apply script manual `backend/payment-service/scripts/init-payment-db.sql`.
3. Start các service cần thiết:
   - `service-discovery`
   - `api-gateway`
   - `rabbitmq`
   - `postgres`
   - `mongo`
   - `restaurant-service`
   - `order-service`
   - `payment-service`
4. Giữ env payout an toàn:

```env
PAYOUT_DRY_RUN=true
PAYOS_PAYOUT_ENABLED=false
```

Test flow:

1. User tạo order và thanh toán PayOS như flow hiện tại.
2. PayOS webhook sync order `paymentStatus=PAID`.
3. Merchant/Admin update order status sang `COMPLETED`.
4. Kiểm tra `payment-service` nhận `MerchantRevenueEvent`.
5. Gọi `GET /api/wallets` bằng token merchant.
6. Expected:
   - `availableBalance` tăng theo `order.totalPrice`
   - có transaction `EARN`, `COMPLETED`
7. Merchant tạo bank account.
8. Merchant tạo withdrawal request.
9. Expected:
   - `availableBalance` giảm
   - `pendingWithdrawal` tăng
   - payout request status `PENDING`
   - transaction `WITHDRAW`, `PENDING`
10. Admin approve request.
11. Admin tạo payout batch.
12. Với dry-run:
   - batch `COMPLETED`
   - payout request `COMPLETED`
   - transaction `COMPLETED`
   - `pendingWithdrawal` giảm
   - `totalWithdrawn` tăng

### 5.3 Test các case lỗi quan trọng

- Merchant withdraw số tiền lớn hơn `availableBalance` -> phải lỗi.
- Merchant dùng bank account id không thuộc merchant đó -> phải lỗi.
- Admin reject request -> tiền phải quay về `availableBalance`.
- Admin batch request không phải `APPROVED` -> phải lỗi.
- Gửi lại `MerchantRevenueEvent` cùng `idempotencyKey` -> không được cộng tiền lần 2.
- Live payout thiếu credentials -> phải trả lỗi rõ ràng.

## 6. Cách Test Frontend

### 6.1 Merchant wallet page

URL:

- `/merchant/wallet`

Checklist:

- Page load được khi login role `MERCHANT`.
- Balance cards hiển thị đúng:
  - Available Balance
  - Pending Withdrawal
  - Total Earned
  - Total Withdrawn
- Add bank account:
  - nhập bank name
  - nhập bank BIN
  - nhập account number
  - nhập account holder name
  - save thành công
- Edit bank account:
  - sửa thông tin
  - set default
  - delete/soft delete
- Withdraw:
  - không cho submit nếu chưa chọn bank account
  - không cho submit nếu amount lớn hơn available balance
  - submit thành công thì refresh balance và transaction table
- Transaction table:
  - `EARN` hiển thị revenue
  - `WITHDRAW` hiển thị withdrawal
  - amount âm/dương hiển thị đúng màu
  - pagination hoạt động

### 6.2 Admin payout page

URL:

- `/admin/wallet`

Checklist:

- Sidebar admin có menu `Wallet Payouts`.
- Page load được khi login role `ADMIN`.
- Filter status hoạt động:
  - `PENDING`
  - `APPROVED`
  - `PROCESSING`
  - `COMPLETED`
  - `REJECTED`
  - `FAILED`
- Approve request:
  - request `PENDING` chuyển sang `APPROVED`
- Reject request:
  - nhập rejection reason
  - request chuyển `REJECTED`
  - merchant balance được hoàn lại
- Process batch:
  - chỉ chọn được request `APPROVED`
  - batch dry-run trả `COMPLETED`
  - request chuyển `COMPLETED`
- Retry:
  - chỉ hiện với request `FAILED`
- Badge `DRY RUN`:
  - hiển thị khi backend trả `dryRun=true`

### 6.3 Frontend cần bổ sung/hoàn thiện tiếp

Các phần hiện tại đủ để demo flow, nhưng nên cải thiện thêm:

- Thay `window.prompt` khi admin reject bằng modal có form và validation.
- Mask account number ở UI, ví dụ chỉ hiển thị 4 số cuối.
- Thêm search/filter merchant id/date range trên admin payout page.
- Thêm loading state riêng cho từng action button.
- Thêm empty/error state đẹp hơn cho admin payout page.
- Thêm confirmation dialog trước khi delete bank account và process batch.
- Thêm responsive test kỹ trên mobile cho bảng payout.

## 7. Test Live PayOS Payout

Chỉ test live khi nhóm chắc chắn dùng bank account riêng cho đồ án và amount nhỏ.

Checklist trước khi bật live:

1. PayOS account đã được bật quyền Payout.
2. Bank account nguồn là tài khoản nhóm, không dùng tài khoản cá nhân.
3. `.env` có:

```env
PAYOS_PAYOUT_CLIENT_ID=...
PAYOS_PAYOUT_API_KEY=...
PAYOS_PAYOUT_CHECKSUM_KEY=...
PAYOS_PAYOUT_ENABLED=true
PAYOUT_DRY_RUN=false
```

4. Gọi `GET /api/admin/wallets/payout-account/balance` kiểm tra balance nguồn.
5. Tạo payout amount nhỏ.
6. Verify:
   - PayOS dashboard có payout record
   - merchant bank nhận tiền
   - DB lưu `providerPayoutId`, `providerReferenceId`, `providerResponseJson`

## 8. Known Limitations Và Follow-up

Các điểm nên làm tiếp nếu muốn production-ready hơn:

- Chưa có webhook/scheduler reconciliation riêng cho payout status từ PayOS sau khi batch được tạo.
- Bank account number hiện lưu plain text trong DB, nên thêm encryption/masking nếu triển khai thật.
- Chưa có monthly auto payout cron; hiện admin process batch thủ công.
- Revenue đang credit theo `order.totalPrice`, chưa tách phí nền tảng, delivery fee, tax, discount.
- Chưa có unit test riêng cho `WalletServiceImpl`; hiện đã compile/test module nhưng nên bổ sung test nghiệp vụ wallet.
- Chưa có audit log chi tiết cho admin action ngoài các field `processedByAdminId`, `processedAt`.
- Chưa có UI chi tiết payout batch history.

## 9. Gợi Ý Chia Việc Cho Nhóm

- Backend member:
  - bổ sung unit test cho wallet service
  - bổ sung endpoint xem payout batch history
  - bổ sung reconciliation PayOS payout status nếu cần
- Frontend member:
  - thay prompt reject bằng modal
  - thêm filter merchant/date
  - polish responsive UI
- DevOps/member phụ trách env:
  - thêm PayOS payout env vào file `.env` dùng chung trên Drive
  - đảm bảo DB init script được apply khi chạy local/docker
- QA/member test:
  - test dry-run E2E trước
  - chỉ test live PayOS với amount nhỏ và tài khoản nhóm

## 10. Ghi Chú Scope Review PR #121

- Các fix trong lượt review này tập trung vào `payment-service`: explicit `InternalFilter`, refactor DTO `request/response`, giữ pagination response không vỡ frontend, cập nhật env example, seed-db note và payment docs.
- Comment liên quan `order-service` như `merchantId` trong order model, logic phát revenue event, hoặc ảnh model order trong báo cáo nên để owner của `order-service` kiểm tra và cập nhật.
- Nếu nhóm cần ảnh DB model trong báo cáo, có thể dựng lại từ bảng quan hệ ở mục 2.2; repo hiện lưu ảnh dạng binary nên phần đó nên được cập nhật bởi người phụ trách báo cáo/tài liệu.
