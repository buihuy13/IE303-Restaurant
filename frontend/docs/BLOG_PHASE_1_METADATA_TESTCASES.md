# Blog Phase 1A/1B Metadata Testcases

## Scope

Phase 1A/1B focuses on real Blog metadata only:

- Backend schema/API supports: `excerpt`, `category`, `tags`, `readTime`, `featured`, `viewsCount`, `likesCount`, `commentsCount`.
- Create/Edit sends real metadata fields to backend.
- Public list/detail/My Blogs render metadata from API mode.
- API mode no longer uses mock fallback for `views`, `likes`, `commentsCount`, `category`, or `tags`.

Not included in this phase:

- Real comments form/list API integration.
- Real like button interaction.
- View tracking from frontend.
- Backend-side search/filter migration.
- Backend-driven editorial template UI.

## Backend Smoke Test

Start required services:

```bash
docker compose -f docker-compose.local.yml up -d postgres keycloak
cd backend
./gradlew :service-discovery:bootRun
./gradlew :api-gateway:bootRun
./gradlew :blog-service:bootRun
```

If your Postgres volume already existed, rerun seed manually against `blog_service` because Docker init SQL only runs on first volume creation.

From the repository root:

```bash
psql "postgresql://postgres:postgres@localhost:5432/blog_service" -f backend/seed-db/blog_service.sql
```

Verify public list includes metadata:

```bash
curl "http://localhost:8080/api/blogs?page=0&size=6&sort=publishedAt,desc"
```

Expected:

- `content.length > 0`
- each seed post has `excerpt`
- seed posts have `category`
- seed posts have `tags`
- seed posts have `readTime`
- seed posts have numeric `viewsCount`, `likesCount`, `commentsCount`
- some seed posts have `featured: true`

Verify detail includes metadata:

```bash
curl "http://localhost:8080/api/blogs/slug/market-notes-cleaner-lunch-menu"
```

Expected:

- `category` is `Menu Strategy`
- `tags` includes `lunch`, `menu`, `market`
- `featured` is `true`
- `viewsCount` and `likesCount` are numbers

## Frontend Public Blog Test

Run frontend in API mode:

```bash
cd frontend
NEXT_PUBLIC_BLOG_DATA_SOURCE=api npm run dev
```

Open:

```text
http://localhost:3000/blog
```

Expected:

- Latest Articles cards show API category/read-time data.
- Hero carousel can use API `featured` posts.
- No fake mock-only metrics should appear if backend does not return them.
- Search/filter still works client-side for this phase.

Open one article:

```text
http://localhost:3000/blog/market-notes-cleaner-lunch-menu
```

Expected:

- Detail sidebar shows real category, read time, views, likes, comments count.
- Tags box uses API tags.
- Author may still use fallback text until Phase 7 author service integration.
- Like button/comment submit are not real yet in this phase.

## Create/Edit Metadata Test

Login as `ADMIN` or `MERCHANT`.

Open:

```text
http://localhost:3000/blog/create
```

Create a post with:

- Title: `Phase 1 Metadata Test`
- Excerpt: `Short API metadata summary for frontend verification.`
- Category: `Test Category`
- Tags: `phase-one, metadata, api`
- Featured: checked
- Status: `Published`
- Content: any valid markdown paragraph

Expected after submit:

- Redirects to My Blogs.
- Published tab includes the article.
- Public `/blog` can show the article with `Test Category`.
- Detail page shows tags `phase-one`, `metadata`, `api`.

Edit the same post:

- Change category to `Updated Category`
- Remove or add one tag
- Toggle Featured

Expected:

- Save succeeds.
- My Blogs/list/detail reflect updated metadata after refresh.

## Quality Checks

```bash
cd backend && ./gradlew :blog-service:test
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
```

## Review Notes Before Next Phase

Confirm with the team before moving on:

- Are `category` and comma-separated `tags` enough for now, or should tags/categories become managed entities later?
- Should `featured` be editable by both `ADMIN` and `MERCHANT`, or admin-only?
- Should API mode show zero metrics, or hide metrics until comments/likes/views are implemented fully?
