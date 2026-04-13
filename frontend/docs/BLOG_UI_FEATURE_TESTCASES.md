# Blog UI Feature Testcases

File này dùng để nắm nhanh hiện tại Blog FE đang có chức năng gì và test thủ công sau Phase 1.

## Test Modes

| Mode | Env | Mục đích |
| --- | --- | --- |
| API mode | Không set `NEXT_PUBLIC_BLOG_DATA_SOURCE`, hoặc set `NEXT_PUBLIC_BLOG_DATA_SOURCE=api` | Test với blog-service thật. Đây là mặc định. |
| Mock mode | Set `NEXT_PUBLIC_BLOG_DATA_SOURCE=mock` rồi restart Next dev server | Demo giao diện Food magazine với field FE cần nhưng backend chưa có. |

Lưu ý: các field mock như `category`, `tags`, `views`, `likes`, `commentsCount`, `featured`, `authorAvatarUrl` chỉ để demo UI. Create/Edit không gửi các field này lên backend.

## Public Blog List

Route: `/blog`

| ID | Mode | Bước test | Kỳ vọng |
| --- | --- | --- | --- |
| BLOG-LIST-01 | API | Mở `/blog` khi backend gateway + blog-service đang chạy | Trang load danh sách bài `PUBLISHED` thật từ API. |
| BLOG-LIST-02 | API | Tắt API hoặc làm API lỗi rồi reload `/blog` | Hiển thị loading rồi báo lỗi toast/empty state, không crash trang. |
| BLOG-LIST-03 | Mock | Bật mock mode và mở `/blog` | Hiển thị editorial header, featured story lớn, editor picks, latest grid, kitchen tags. |
| BLOG-LIST-04 | Mock/API | Gõ keyword vào ô search | Danh sách lọc client-side theo title/excerpt/category/tags có trong dữ liệu đang load. |
| BLOG-LIST-05 | Mock | Chọn category | Grid chỉ còn bài thuộc category đã chọn. |
| BLOG-LIST-06 | Mock/API | Đổi sort `Latest`, `Oldest`, `Popular` | Danh sách sắp xếp lại client-side. API mode chưa có popularity thật nên `Popular` chỉ fallback theo dữ liệu hiện có. |
| BLOG-LIST-07 | Mock/API | Bấm pagination nếu có nhiều trang | Chuyển page và scroll về đầu trang. |
| BLOG-LIST-08 | Mock/API | Bấm một article card hoặc featured story | Điều hướng sang `/blog/[slug]`. |

## Blog Detail

Route: `/blog/[slug]`

| ID | Mode | Bước test | Kỳ vọng |
| --- | --- | --- | --- |
| BLOG-DETAIL-01 | API | Mở detail của một bài published thật | Render title, excerpt fallback, cover image nếu có, markdown content. |
| BLOG-DETAIL-02 | Mock | Mở detail của một bài mock | Render author block, role, cover lớn, read time, category/tags, metrics mock. |
| BLOG-DETAIL-03 | Mock/API | Bài có heading markdown `##` hoặc `###` | Sidebar `In this story` hiển thị table of contents và click được anchor. |
| BLOG-DETAIL-04 | Mock/API | Bấm `Share` | Nếu browser hỗ trợ native share thì mở share dialog; nếu không thì copy link và nút đổi sang `Copied`. |
| BLOG-DETAIL-05 | Mock/API | Xem cuối bài | Related posts hiển thị từ mock/current API latest posts, không render comment form thật. |
| BLOG-DETAIL-06 | Mock/API | Mở slug không tồn tại | Hiển thị not found state, không crash. |

## My Blogs Manager

Route: `/blog/my-blogs`

Yêu cầu login role `ADMIN` hoặc `MERCHANT`.

| ID | Mode | Bước test | Kỳ vọng |
| --- | --- | --- | --- |
| BLOG-MY-01 | API | Chưa login rồi mở `/blog/my-blogs` | Redirect về `/login`. |
| BLOG-MY-02 | API | Login user không có quyền quản lý blog | Redirect về `/blog`. |
| BLOG-MY-03 | API | Login `ADMIN` hoặc `MERCHANT` rồi mở `/blog/my-blogs` | Hiển thị writer desk, stats cards, status tabs, list bài của user theo backend. |
| BLOG-MY-04 | Mock | Bật mock mode và mở `/blog/my-blogs` | Hiển thị dashboard mock gồm All/Drafts/Published/Archived và metrics demo. |
| BLOG-MY-05 | Mock/API | Click status tabs `All`, `Draft`, `Published`, `Archived` | List đổi theo status. API mode gọi endpoint thật tương ứng. |
| BLOG-MY-06 | API | Bấm `View published post` trên bài `PUBLISHED` | Điều hướng sang `/blog/[slug]`. Nút này chỉ hiện cho bài published. |
| BLOG-MY-07 | API | Bấm `Edit` | Điều hướng sang `/blog/edit/[id]`. |
| BLOG-MY-08 | API | Bấm `Archive` và confirm | Gọi delete/archive action thật hiện có, refresh list sau khi thành công. |
| BLOG-MY-09 | API | Bài đã `ARCHIVED` | Nút archive disabled và hiển thị `Archived`. |

## Create Blog

Route: `/blog/create`

Yêu cầu login role `ADMIN` hoặc `MERCHANT`.

| ID | Mode | Bước test | Kỳ vọng |
| --- | --- | --- | --- |
| BLOG-CREATE-01 | API | Mở `/blog/create` | Hiển thị form title, cover image, status, markdown editor, live preview panel. |
| BLOG-CREATE-02 | API | Nhập title/content | Preview panel cập nhật theo nội dung hiện tại. |
| BLOG-CREATE-03 | API | Upload cover image | Cover preview hiển thị ở form và preview panel. |
| BLOG-CREATE-04 | API | Chọn status `DRAFT` rồi submit | Gửi payload backend thật gồm `title`, `content`, `coverImageUrl`, `status`. Không gửi category/tags/mock metrics. |
| BLOG-CREATE-05 | API | Chọn status `PUBLISHED` rồi submit | Tạo bài published, sau đó có thể kiểm tra ở `/blog` và `/blog/my-blogs?status=PUBLISHED` tùy routing hiện tại. |
| BLOG-CREATE-06 | API | Paste/drop image vào markdown editor | Gọi upload image hiện có rồi insert markdown image URL vào content. |

## Edit Blog

Route: `/blog/edit/[id]`

Yêu cầu login role `ADMIN` hoặc `MERCHANT`.

| ID | Mode | Bước test | Kỳ vọng |
| --- | --- | --- | --- |
| BLOG-EDIT-01 | API | Mở edit từ một bài trong my-blogs | Load dữ liệu bài theo id và fill vào form. |
| BLOG-EDIT-02 | API | Sửa title/content/status | Preview panel cập nhật tức thì. |
| BLOG-EDIT-03 | API | Remove hoặc đổi cover image | Preview form và preview panel cập nhật theo cover mới. |
| BLOG-EDIT-04 | API | Submit update | Gửi payload backend thật gồm `title`, `content`, `coverImageUrl`, `status`. |
| BLOG-EDIT-05 | API | Chọn status `ARCHIVED` rồi submit | Bài đổi sang archived nếu backend cho phép update status này. |

## Responsive UI

| ID | Route | Viewport | Kỳ vọng |
| --- | --- | --- | --- |
| BLOG-RWD-01 | `/blog` | 390px mobile | Header, filters, featured, grid, sidebar content xếp dọc, text không tràn. |
| BLOG-RWD-02 | `/blog/[slug]` | 390px mobile | Cover, title, metadata, content đọc được; TOC desktop không chiếm chỗ mobile. |
| BLOG-RWD-03 | `/blog/my-blogs` | 390px mobile | Stats cards và blog cards xếp dọc, action buttons không vỡ layout. |
| BLOG-RWD-04 | `/blog/create`, `/blog/edit/[id]` | 768px tablet | Editor và preview vẫn đọc được; không che nút submit. |
| BLOG-RWD-05 | `/blog` | 1440px desktop | Layout magazine có hero, grid và sidebar rõ ràng. |

## Current Phase 1 Limits

- Search/filter/sort đang là client-side, chưa phải backend search thật.
- Related posts đang lấy từ mock hoặc latest posts fallback, chưa có endpoint related thật.
- Views/likes/comments chỉ có trong mock mode; API mode không show số liệu nếu backend chưa trả.
- Không có comment form thật trong Phase 1.
- Không có autosave thật trong editor.
- Không có category/tags trong create/update payload vì backend hiện chưa hỗ trợ.
