# Blog Service API Contract

## Scope
This document summarizes stable API rules for `blog-service` after phase 6 finalize.

## Core Rules
- `GET /api/blogs` returns only `PUBLISHED` posts.
- Slug endpoint uses `/api/blogs/slug/{slug}`.
- Delete is soft delete only: status changes to `ARCHIVED`.
- Cloudinary `public_id` is internal and never exposed in blog response payload.

## Endpoints
- `POST /api/blogs/images/upload`
  - Multipart key: `images` (one or more files).
  - Requires role `ADMIN` or `MERCHANT`.
  - Response returns `imageUrls` only.
- `POST /api/blogs`
  - Create blog with full payload.
  - `status` defaults to `DRAFT` if omitted.
- `PUT /api/blogs/{id}`
  - Full update payload.
  - Title change regenerates slug.
- `GET /api/blogs`
  - Public list of published posts only.
- `GET /api/blogs/{id}`
  - Returns unpublished post only for owner/admin.
- `GET /api/blogs/slug/{slug}`
  - Public read for published posts only.
- `GET /api/blogs/drafts`
  - Author-scoped draft list.
- `GET /api/blogs/archived`
  - Author-scoped archived list.
- `DELETE /api/blogs/{id}`
  - Soft delete to `ARCHIVED`.

## Common Error Cases
- `400` invalid payload, invalid URL, unsupported file type, multipart error.
- `403` missing permission or wrong role.
- `404` blog not found or slug is not published.
- `413` upload payload too large.

## Upload Validation Rules
- Max files per request: configured by `BLOG_IMAGE_MAX_FILES_PER_UPLOAD`.
- Max file size: configured by `BLOG_IMAGE_MAX_FILE_SIZE_BYTES`.
- Allowed MIME types: configured by `BLOG_IMAGE_ALLOWED_CONTENT_TYPES`.

