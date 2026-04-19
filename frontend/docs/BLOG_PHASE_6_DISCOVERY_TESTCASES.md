# Blog Phase 6 Discovery Testcases

## Mục tiêu

Phase 6 chuyển public `/blog` sang backend-side discovery:

- List bài viết gọi `GET /api/blogs` với `page`, `size=6`, `search`, `category`, `sort`.
- Hero carousel lấy bài `featured=true` riêng, không đổi theo search/filter.
- Category chips lấy từ `GET /api/blogs/categories`.
- Detail related articles lấy từ `GET /api/blogs/related/{blogId}?size=3`.

## Test `/blog`

Mở DevTools > Network, filter `blogs`.

1. Mở `http://localhost:3000/blog`.
2. Kỳ vọng có request:
   - `GET /api/blogs?page=0&size=6&sort=publishedAt,desc`
   - `GET /api/blogs?page=0&size=3&featured=true&sort=publishedAt,desc`
   - `GET /api/blogs/categories`
3. Grid chỉ hiển thị tối đa 6 bài mỗi trang.
4. Hero carousel không biến mất khi search không có kết quả.

## Test Search Theo Tiêu Đề

1. Nhập keyword vào search box.
2. Kỳ vọng request list có query `search=<keyword>`.
3. Kỳ vọng backend chỉ search theo `title`.
4. Keyword có trong title thì trả kết quả.
5. Keyword chỉ có trong content/excerpt/category/tag nhưng không có trong title thì không trả kết quả.
6. Trong lúc search, chỉ khu vực article grid hiển thị skeleton/loading; hero carousel và filter không bị unmount.
7. Hero carousel giữ nguyên vì đang dùng featured request riêng.

## Test Category

1. Bấm quick chip category hoặc chọn dropdown category.
2. Kỳ vọng request list có query `category=<category>`.
3. Pagination quay về page 1.

## Test Sort

- `Latest` -> request có `sort=publishedAt,desc`.
- `Oldest` -> request có `sort=publishedAt,asc`.
- `Popular` -> request có `sort=viewsCount,desc`.

## Test Related Articles

1. Mở một bài detail.
2. Network có `GET /api/blogs/related/{blogId}?size=3`.
3. Related Articles hiển thị tối đa 3 bài.

## Mock Mode

```bash
cd frontend
NEXT_PUBLIC_BLOG_DATA_SOURCE=mock npm run dev
```

Kỳ vọng:

- UI vẫn dùng mock data để demo.
- Không cần backend API cho search/filter/related.
