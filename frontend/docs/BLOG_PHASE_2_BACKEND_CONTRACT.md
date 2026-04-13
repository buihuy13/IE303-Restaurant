# Blog API Contract Needed For Phase 2

Phase 1 keeps the backend unchanged and uses `NEXT_PUBLIC_BLOG_DATA_SOURCE=mock` only to prototype the upgraded blog UI. These fields and APIs should be reviewed before implementing Phase 2 on the backend.

## Phase 1 Demo Modes

- API mode: leave `NEXT_PUBLIC_BLOG_DATA_SOURCE` unset, or set `NEXT_PUBLIC_BLOG_DATA_SOURCE=api`.
- Mock mode: set `NEXT_PUBLIC_BLOG_DATA_SOURCE=mock`, then restart the Next.js dev server.
- API mode should remain the default for local production-like testing.

## Fields To Consider

- `excerpt`: short article summary for list cards, hero, and related posts.
- `authorName`: public author display name.
- `authorAvatarUrl`: optional author avatar for article detail and editorial cards.
- `authorRole`: optional role line such as editor, chef, or restaurant operator.
- `category`: single editorial category for filter/sidebar.
- `tags`: tag list for detail, related posts, and discovery UI.
- `readTime`: reading time in minutes, either computed by backend or returned from content metadata.
- `viewsCount`: read analytics for dashboard and popular sorting.
- `likesCount`: engagement count if likes are supported.
- `commentsCount`: comment count if comments are supported.
- `featured`: editorial flag for hero and secondary featured placement.

## APIs To Consider

- `GET /api/blogs` backend-side search/filter/sort by `q`, `category`, `tag`, `featured`, and popularity.
- `GET /api/blogs/slug/{slug}/related` for related posts by category/tags.
- `GET /api/blogs/categories` for category navigation and counts.
- `GET /api/blogs/tags` for tag navigation and counts.
- Comments API for listing and creating comments if comment UI becomes real.
- Likes or bookmarks API if engagement actions become real.
- Views tracking endpoint or event pipeline if view counts become real analytics.

## Phase 1 Guardrails

- Do not send mock-only fields in create/update payloads.
- Keep API mode as the default data source.
- Use mock mode only for design demo and contract discovery.
