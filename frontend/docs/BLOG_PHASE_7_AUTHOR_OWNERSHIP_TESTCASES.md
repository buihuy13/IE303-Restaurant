# Blog Phase 7 Author And Ownership Testcases

## Mục tiêu

Phase 7 làm author data thật hơn:

- Blog service resolve `authorName` từ `user-service` bằng `authorId`.
- Nếu user-service lỗi hoặc thiếu user, blog vẫn load bằng fallback `FoodEats Editor`.
- `authorAvatarUrl` hiện vẫn có thể `null` vì user-service chưa có avatar field.
- Ownership hiện tại không đổi: merchant quản lý bài của mình, admin có quyền quản lý rộng hơn.

## Test Author Data

1. Đảm bảo `user-service`, `blog-service`, `api-gateway` đang chạy.
2. Gọi:

```bash
curl "http://localhost:8080/api/blogs?page=0&size=3&sort=publishedAt,desc"
```

Kỳ vọng mỗi bài có:

- `authorId`
- `authorName`
- `authorRole`
- `authorAvatarUrl` có thể là `null`

## Test Fallback Khi User Service Tắt

1. Tạm dừng `user-service`.
2. Restart hoặc reload `blog-service` nếu cần.
3. Gọi lại public blogs.

Kỳ vọng:

- API blog vẫn trả `200`.
- `authorName` fallback là `FoodEats Editor`.
- Không crash list/detail.

## Test FE Detail

1. Mở `/blog/<slug>`.
2. Author box hiển thị tên từ API mode.
3. Nếu backend fallback, FE vẫn hiển thị author box ổn.

## Test Ownership

### Merchant

1. Login merchant.
2. Mở `/blog/my-blogs`.
3. Kỳ vọng chỉ thấy bài thuộc merchant đó ở Draft/Published/Archived.
4. Edit/archive bài của mình thành công.

### Admin

1. Login admin.
2. Kiểm tra các flow quản lý blog vẫn hoạt động.

### Public

1. Logout.
2. Mở `/blog`.
3. Chỉ thấy bài `PUBLISHED`.
4. Không thấy nút quản trị.
