# Blog Full Feature Regression Checklist

## Public Blog

- `/blog` load bằng API mode khi `NEXT_PUBLIC_BLOG_DATA_SOURCE=api`.
- Search/filter/sort/pagination gọi backend params thật.
- Hero carousel lấy featured posts riêng và không đổi theo search/filter.
- `/blog/[slug]` render cover, details, author, tags, comments, related articles.
- Related Articles dùng API related thật.

## Create/Edit/My Blogs

- Merchant/admin tạo bài với title, excerpt, category, tags, featured, cover, content, status.
- Use editorial template gọi API template render.
- Edit giữ metadata đúng.
- Archive bài hoạt động.
- My Blogs stats không crash khi có metrics thật.

## Comments

- Guest không post comment.
- Authenticated user post comment thành công.
- Comment list refetch realtime khi comment count tăng.
- Admin/merchant hide/restore comment trong `/blog/my-blogs`.
- Hide/restore cập nhật `Talks` realtime.

## Likes

- Guest bấm like được nhắc login.
- User login like/unlike thành công.
- Tab khác thấy likes count realtime.

## Views

- Detail page gọi `POST /views` khi đủ điều kiện localStorage.
- Backend chống spam trong 24 giờ.
- Views không realtime giữa nhiều tab; reload/detail API mới thấy số mới.

## Mock Mode

```bash
NEXT_PUBLIC_BLOG_DATA_SOURCE=mock npm run dev
```

- `/blog`, detail, my-blogs vẫn demo UI được.
- Mock mode không bắt buộc backend chạy.

## Quality Commands

```bash
cd backend && ./gradlew :blog-service:test
cd backend && ./gradlew :api-gateway:compileJava
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
```
