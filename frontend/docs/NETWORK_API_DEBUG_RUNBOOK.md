# Network API Debug Runbook

File này dùng khi FE báo lỗi kiểu:

- `Failed to load`
- `Network Error`
- Không load được data
- Submit form không gọi được API
- API trước đó chạy được nhưng reload lại thì lỗi

Mục tiêu là xác định lỗi nằm ở đâu: FE không gửi request, sai URL, CORS, token/auth, API Gateway, service backend, hay database.

## 1. Mở Network Tab Đúng Cách

1. Mở Chrome DevTools:
   - Mac: `Cmd + Option + I`
   - Windows/Linux: `Ctrl + Shift + I`
2. Chọn tab `Network`.
3. Bật:
   - `Preserve log`: giữ request khi trang redirect/reload.
   - `Disable cache`: tránh browser dùng cache cũ.
4. Chọn filter `Fetch/XHR`.
5. Reload lại trang hoặc bấm lại action gây lỗi.

Nếu không thấy request nào xuất hiện, nhiều khả năng FE chưa gọi API, bị chặn bởi điều kiện UI, hoặc component chưa chạy tới đoạn call API.

## 2. Checklist Nhanh Khi Một API Lỗi

Click vào request bị lỗi trong Network, kiểm tra theo thứ tự:

1. `Name`: request đang gọi endpoint nào?
2. `Status`: mã lỗi là gì?
3. `Request URL`: URL có đúng gateway không?
4. `Request Method`: `GET`, `POST`, `PUT`, `DELETE` có đúng không?
5. `Payload`: body gửi lên có đúng field backend cần không?
6. `Request Headers`: có `Authorization` khi API cần login không?
7. `Response`: backend trả message gì?
8. `Timing`: request có timeout hoặc pending quá lâu không?

## 3. Đọc Status Code

| Status | Ý nghĩa thường gặp | Cách xử lý |
| --- | --- | --- |
| `200` | API thành công | Kiểm tra response data có đúng shape FE cần không. |
| `201` | Tạo mới thành công | Với `POST`, đây là kết quả tốt. |
| `204` | Thành công nhưng không có body | FE không nên mong chờ JSON body. |
| `400` | Payload sai hoặc validation fail | Mở tab `Payload` và `Response`, so với DTO backend. |
| `401` | Chưa login, token thiếu/hết hạn/sai | Login lại, kiểm tra header `Authorization`. |
| `403` | Có login nhưng không đủ quyền | Kiểm tra role `USER`, `MERCHANT`, `ADMIN`. |
| `404` | Sai endpoint hoặc resource không tồn tại | Kiểm tra URL, id/slug, gateway route. |
| `409` | Conflict dữ liệu | Ví dụ slug/email/unique key bị trùng. |
| `500` | Backend service lỗi | Xem log service tương ứng. |
| `(failed)` | Browser không nhận được response | Thường là CORS, backend down, gateway down, DNS/port sai. |
| `CORS error` | Browser chặn cross-origin | Kiểm tra origin FE và config CORS gateway. |

## 4. Kiểm Tra Request URL

FE nên gọi API qua API Gateway:

```text
http://localhost:8080/api/...
```

Ví dụ Blog:

```text
GET  http://localhost:8080/api/blogs?page=0&size=6&sort=publishedAt,desc
GET  http://localhost:8080/api/blogs/{blogId}/comments?page=0&size=2&sort=createdAt,desc
POST http://localhost:8080/api/blogs/{blogId}/comments
```

Nếu thấy URL lạ như:

```text
http://blog-service:8083/api/...
http://api-gateway:8080/api/...
undefined/api/...
```

thì có thể FE đang dùng sai env hoặc đang chạy trong context khác.

Kiểm tra env FE:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Sau khi đổi env, phải restart FE dev server:

```bash
cd frontend
npm run dev
```

## 5. Kiểm Tra Token/Auth

Trong request cần login, mở:

```text
Headers -> Request Headers
```

Tìm:

```text
Authorization: Bearer <token>
```

Quy tắc:

- API public `GET /api/blogs`, `GET /api/blogs/slug/...`, `GET /api/blogs/{id}/comments` không cần token.
- API cần login như create/edit blog, upload image, post comment, like phải có token.
- Nếu API cần login mà không có `Authorization`, FE chưa attach token hoặc user chưa login.
- Nếu có `Authorization` nhưng vẫn `401`, token có thể hết hạn/sai realm/sai issuer.

Không copy token vào chat hoặc commit vào file. Nếu cần debug, chỉ nói request có token hay không.

## 6. Debug GET API

Ví dụ `/blog` không lấy được bài:

1. Mở `/blog`.
2. Network -> Fetch/XHR.
3. Tìm request:

```text
GET /api/blogs
```

4. Kiểm tra:
   - Status có phải `200` không?
   - Query params có đúng không?
   - Response có `content` không?

Response đúng thường giống:

```json
{
  "content": [],
  "totalElements": 0,
  "totalPages": 0,
  "number": 0,
  "size": 6
}
```

Nếu `200` nhưng `content: []`, API không lỗi. Chỉ là database không có data phù hợp filter/search/status.

Nếu `401`, có thể request public đang bị gửi kèm token lỗi. Kiểm tra `Authorization` header.

Nếu `(failed)`, kiểm tra gateway có chạy không:

```bash
curl -i http://localhost:8080/actuator/health
```

## 7. Debug POST API

Ví dụ post comment không được:

1. Login trước.
2. Mở blog detail.
3. Submit comment.
4. Network -> tìm:

```text
POST /api/blogs/{blogId}/comments
```

5. Kiểm tra `Headers`:

```text
Authorization: Bearer ...
Content-Type: application/json
```

6. Kiểm tra `Payload`:

```json
{
  "message": "Nội dung comment",
  "notify": false
}
```

7. Đọc status:
   - `201`: tạo comment thành công.
   - `400`: message rỗng hoặc payload sai.
   - `401`: chưa login hoặc token hết hạn.
   - `403`: login rồi nhưng gateway/backend không cho quyền.
   - `404`: blogId sai hoặc bài không published.
   - `500`: lỗi backend, xem log `blog-service`.

## 8. Copy Request Thành Curl

Khi cần test lại request ngoài browser:

1. Right click request trong Network.
2. Chọn `Copy`.
3. Chọn `Copy as cURL`.
4. Dán vào terminal.

Lưu ý:

- Với request có token, curl sẽ chứa `Authorization`. Không gửi nguyên curl đó cho người khác.
- Có thể xóa token rồi test behavior guest.
- Nếu curl chạy được nhưng browser lỗi, vấn đề thường là CORS, cookie/token trong browser, hoặc FE runtime.
- Nếu curl cũng lỗi, vấn đề thường nằm ở gateway/backend/service/database.

## 9. So Sánh Browser Và Curl

### Case 1: Curl thành công, Browser lỗi

Khả năng cao:

- FE gửi thiếu token.
- FE gửi token cũ.
- FE gửi sai payload.
- CORS/preflight lỗi.
- Dev server đang dùng bundle/env cũ.

Cách xử lý:

```bash
cd frontend
npm run dev
```

Sau đó logout/login lại nếu lỗi liên quan auth.

### Case 2: Browser và Curl đều lỗi

Khả năng cao:

- Gateway chưa restart sau khi sửa code.
- Service backend chưa chạy.
- Route gateway sai.
- Backend service lỗi logic.
- DB thiếu table/column/data.

Kiểm tra:

```bash
curl -i http://localhost:8080/actuator/health
jps -lv | rg 'api_gateway|blog_service|service_discovery'
```

## 10. Kiểm Tra OPTIONS Preflight

Với `POST`, `PUT`, `DELETE`, browser có thể gửi request `OPTIONS` trước.

Nếu `OPTIONS` lỗi:

- Request chính sẽ không được gửi.
- Đây thường là lỗi CORS.

Trong Network:

```text
OPTIONS /api/...
```

Expected:

- Status `200` hoặc `204`.
- Response headers có `Access-Control-Allow-Origin`.
- Origin FE phải được allow, ví dụ `http://localhost:3000`.

## 11. Quy Trình Debug Chuẩn

Khi báo lỗi API, ghi lại theo format này:

```text
Route FE:
Action:
Request URL:
Method:
Status:
Payload:
Has Authorization header: yes/no
Response message:
Curl result:
```

Ví dụ:

```text
Route FE: /blog/market-notes-cleaner-lunch-menu
Action: Submit comment
Request URL: http://localhost:8080/api/blogs/xxx/comments
Method: POST
Status: 401
Payload: {"message":"test","notify":false}
Has Authorization header: no
Response message: empty
Curl result: 401 without token, 201 with valid token
```

Kết luận từ ví dụ trên:

```text
Backend OK. Browser chưa gửi token hoặc user chưa login đúng phiên.
```

## 12. Blog API Debug Cheatsheet

### Load public blogs

```bash
curl -i "http://localhost:8080/api/blogs?page=0&size=6&sort=publishedAt,desc"
```

Expected:

- `200 OK`
- Body có `content`.

### Load blog detail by slug

```bash
curl -i "http://localhost:8080/api/blogs/slug/market-notes-cleaner-lunch-menu"
```

Expected:

- `200 OK` nếu slug tồn tại và bài `PUBLISHED`.
- `404` nếu slug sai hoặc bài không public.

### Load comments

```bash
curl -i "http://localhost:8080/api/blogs/$BLOG_ID/comments?page=0&size=2&sort=createdAt,desc"
```

Expected:

- `200 OK`.
- `content: []` vẫn là hợp lệ nếu chưa có comment.

### Create comment

```bash
TOKEN="<paste_access_token_here>"

curl -i -X POST "http://localhost:8080/api/blogs/$BLOG_ID/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"Testing authenticated comment.","notify":false}'
```

Expected:

- `201 Created`.
- Response có `authorId`, `name`, `message`, `status`.

Nếu không có token:

```bash
curl -i -X POST "http://localhost:8080/api/blogs/$BLOG_ID/comments" \
  -H "Content-Type: application/json" \
  -d '{"message":"Guest comment should fail.","notify":false}'
```

Expected:

- `401 Unauthorized`.

## 13. Khi Nào Cần Restart Service?

Restart FE khi:

- Đổi `.env`.
- Sửa axios/config.
- UI vẫn chạy behavior cũ sau khi code đã đổi.

Restart API Gateway khi:

- Sửa CORS.
- Sửa security rule.
- Sửa filter forward header/token.
- Sửa route gateway.

Restart service backend khi:

- Sửa controller/service/DTO/entity/repository.
- Sửa validation.
- Sửa database access logic.

Với Blog comments hiện tại:

- Sửa `POST /comments` auth rule: restart `api-gateway`.
- Sửa DTO/service comment: restart `blog-service`.
- Sửa form/axios: restart `frontend` nếu hot reload không ăn.
