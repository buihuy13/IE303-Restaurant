# Blog Phase 5 Views Testcases

## Phạm vi

Phase 5 hoàn thiện `Views` theo hướng đơn giản, dễ test:

- Backend chống spam view trong cửa sổ rolling 24 giờ.
- Backend lưu event view vào `blog_view_events`.
- `POST /api/blogs/{blogId}/views` trả thêm `viewCounted`.
- Blog detail cập nhật view khi mở/reload trang, không realtime view qua SSE.
- Blog detail vẫn nhận realtime likes/comments qua SSE `GET /api/blogs/{blogId}/metrics/stream`.

Chưa bao gồm:

- Dashboard thống kê view theo ngày.
- Realtime metrics cho card ngoài `/blog`.
- Realtime view giữa nhiều tab/browser.
- Redis/rate-limit nâng cao.

## Chuẩn bị

Restart các service sau khi pull code:

```bash
cd backend
./gradlew :blog-service:bootRun
./gradlew :api-gateway:bootRun
```

Frontend chạy API mode:

```bash
cd frontend
NEXT_PUBLIC_BLOG_DATA_SOURCE=api npm run dev
```

Nếu dùng Docker Compose, restart `blog-service`, `api-gateway`, và frontend container/dev server.

Nếu Postgres Docker volume đã tồn tại từ trước, file seed trong `/docker-entrypoint-initdb.d` sẽ không tự chạy lại. Khi đó cần chạy lại phần SQL tạo bảng `blog_view_events` trong `backend/seed-db/blog_service.sql` thủ công vào database `blog_service`, hoặc reset volume local.

## Test Backend Anti-spam

Lấy một bài published:

```bash
curl "http://localhost:8080/api/blogs?page=0&size=1&sort=publishedAt,desc"
```

Copy `content[0].id` làm `BLOG_ID`.

### Guest Không Login

Request lần đầu:

```bash
curl -i -X POST "http://localhost:8080/api/blogs/$BLOG_ID/views" \
  -H "User-Agent: Manual Phase 5B Test"
```

Kỳ vọng:

- `200 OK`
- `viewsCount` tăng thêm 1.
- `viewCounted: true` nếu IP + User-Agent chưa được tính trong 24 giờ.

Request lần hai trong 24 giờ với cùng IP + User-Agent:

```bash
curl -i -X POST "http://localhost:8080/api/blogs/$BLOG_ID/views" \
  -H "User-Agent: Manual Phase 5B Test"
```

Kỳ vọng:

- `200 OK`.
- `viewsCount` không tăng.
- `viewCounted: false`.

Đổi `User-Agent` để mô phỏng visitor fallback khác:

```bash
curl -i -X POST "http://localhost:8080/api/blogs/$BLOG_ID/views" \
  -H "User-Agent: Manual Phase 5B Test Other Browser"
```

Kỳ vọng:

- Backend vẫn xử lý được.
- Nếu tổ hợp IP + User-Agent mới chưa được tính trong 24 giờ thì `viewCounted: true`.

### Logged-in User

```bash
TOKEN="<paste_access_token_here>"

curl -i -X POST "http://localhost:8080/api/blogs/$BLOG_ID/views" \
  -H "Authorization: Bearer $TOKEN"
```

Kỳ vọng:

- Backend dedupe theo `userId`.
- Cùng user gọi lại trong 24 giờ thì `viewCounted: false`.

### Draft/Archived/Không Tồn Tại

```bash
curl -i -X POST "http://localhost:8080/api/blogs/00000000-0000-0000-0000-000000000000/views"
```

Kỳ vọng:

- `404 Not Found`.

Nếu có id bài `DRAFT` hoặc `ARCHIVED`, gọi `/views` cũng phải trả `404`.

## Test Frontend View Tracking

Mở Chrome DevTools:

1. Tab `Network`.
2. Tick `Preserve log`.
3. Filter `views`.
4. Mở:

```text
http://localhost:3000/blog/<slug>
```

Kỳ vọng lần đầu:

- Có request `POST /api/blogs/{blogId}/views`.
- Request không cần header `X-Blog-Visitor-Id`.
- Status `200`.
- Response có `viewCounted`.
- Box `Details` cập nhật `Views`.

Kiểm tra localStorage:

```js
Object.keys(localStorage).filter((key) => key.startsWith("foodeats.blog.viewed"))
```

Reload cùng bài trong cùng ngày:

- FE có thể không gọi lại `/views` vì localStorage throttle.
- Detail API vẫn trả `viewsCount` mới nhất từ backend.
- Đây là đúng, vì FE tránh request thừa trước khi backend phải dedupe.

Muốn ép FE gọi lại để test backend dedupe:

```js
Object.keys(localStorage)
  .filter((key) => key.startsWith("foodeats.blog.viewed"))
  .forEach((key) => localStorage.removeItem(key))
```

Reload lại detail:

- Network có `POST /views`.
- Nếu vẫn cùng user login hoặc cùng IP + User-Agent guest trong 24 giờ, response phải có `viewCounted: false`.
- `viewsCount` không tăng.

## Test Realtime Likes/Comments SSE

Mở cùng một bài blog detail ở 2 tab hoặc 2 browser.

Trong tab Network, filter:

```text
metrics/stream
```

Kỳ vọng:

- Có request `GET /api/blogs/{blogId}/metrics/stream`.
- Response type là `text/event-stream`.
- Có event `INIT`.
- Connection được giữ bằng heartbeat `PING`.

### View Không Realtime

1. Tab A đang mở blog detail.
2. Tab B mở cùng bài và tạo một view thật.
3. Quay lại Tab A.

Kỳ vọng:

- Số `Views` ở Tab A không bắt buộc tự cập nhật realtime.
- Reload Tab A hoặc mở lại bài, detail API trả `viewsCount` mới nhất.

### Realtime Like

1. Tab A đang mở blog detail.
2. Tab B login và bấm Like/Unlike.

Kỳ vọng:

- Tab A tự cập nhật số `Likes`.
- Tab A không bị đổi trạng thái `Liked` của user hiện tại.

### Realtime Comment

1. Tab A đang mở blog detail.
2. Tab B login và gửi comment.

Kỳ vọng:

- Tab A tự cập nhật số `Talks`.
- Comment list ở Tab A tự refetch page 1 nếu `Talks` tăng.

## Regression

- `/blog` vẫn load danh sách.
- `/blog/<slug>` vẫn load detail.
- Comments vẫn load/post được sau login.
- Likes vẫn like/unlike được sau login.
- Guest vẫn đọc blog và tạo view được.
- Mock mode không gọi `/views` hoặc `/metrics/stream`.

## Quality Checks

```bash
cd backend && ./gradlew :blog-service:test
cd backend && ./gradlew :api-gateway:compileJava
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
```
