# Blog Phase 8 Comment Moderation Testcases

## Mục tiêu

Phase 8 thêm moderation cho comments:

- Admin/merchant xem comments cần review bằng `GET /api/blogs/comments`.
- Admin/merchant đổi status comment bằng `PATCH /api/blogs/comments/{commentId}/status`.
- Khi hide/restore comment, `commentsCount` cập nhật và SSE broadcast metrics.
- Không hỗ trợ nested replies trong phase này.

## Backend Smoke Test

Lấy comment:

```bash
TOKEN="<admin_or_merchant_access_token>"

curl -i "http://localhost:8080/api/blogs/comments?page=0&size=5&sort=createdAt,desc" \
  -H "Authorization: Bearer $TOKEN"
```

Kỳ vọng:

- Admin thấy comments phù hợp.
- Merchant chỉ thấy comments trên bài mình quản lý.
- Guest không token phải bị `401/403`.

Ẩn comment:

```bash
COMMENT_ID="<comment_id>"

curl -i -X PATCH "http://localhost:8080/api/blogs/comments/$COMMENT_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"HIDDEN"}'
```

Kỳ vọng:

- Response `200`.
- Comment trả về `status: HIDDEN`.
- Public `GET /api/blogs/{blogId}/comments` không còn comment đó.

Restore comment:

```bash
curl -i -X PATCH "http://localhost:8080/api/blogs/comments/$COMMENT_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"PUBLISHED"}'
```

Kỳ vọng:

- Comment xuất hiện lại ở public comment list.
- `Talks/commentsCount` tăng lại.

## Frontend Test

1. Login admin hoặc merchant.
2. Mở `/blog/my-blogs`.
3. Kéo xuống panel `Comment moderation`.
4. Đổi filter `All comments`, `Published`, `Hidden`, `Pending`.
5. Bấm `Hide` một comment published.
6. Mở bài detail ở tab khác.

Kỳ vọng:

- Comment bị ẩn khỏi list public.
- `Talks` cập nhật realtime qua SSE.
- Bấm `Restore` thì comment hiện lại.

## Permission Test

- Guest không thấy `/blog/my-blogs`.
- User thường bị redirect khỏi `/blog/my-blogs`.
- Merchant không hide/restore được comment thuộc bài của merchant khác.
