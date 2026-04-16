# Blog Phase 4 Likes Testcases

## Scope

Phase 4 turns Blog likes into a real authenticated feature.

Included:

- Authenticated `POST /api/blogs/{blogId}/likes`.
- Authenticated `DELETE /api/blogs/{blogId}/likes`.
- `likesCount` and `likedByCurrentUser` are returned by backend.
- Blog detail has a real like/unlike button.
- Guest users can read like counts but cannot like.
- Like UI uses optimistic update and rolls back if API fails.

Not included:

- Public list card like interaction.
- Like notification feed.
- List of users who liked a post.

## Backend API Test

First get a published blog id:

```bash
curl "http://localhost:8080/api/blogs?page=0&size=1&sort=publishedAt,desc"
```

Copy `content[0].id` as `BLOG_ID`.

### Guest Like Should Fail

```bash
curl -i -X POST "http://localhost:8080/api/blogs/$BLOG_ID/likes"
```

Expected:

- `401 Unauthorized`

### Authenticated Like

```bash
TOKEN="<paste_access_token_here>"

curl -i -X POST "http://localhost:8080/api/blogs/$BLOG_ID/likes" \
  -H "Authorization: Bearer $TOKEN"
```

Expected:

- `200 OK`
- Response has:
  - `blogId`
  - `likesCount`
  - `commentsCount`
  - `likedByCurrentUser: true`

### Idempotent Like

Run the same authenticated like command again.

Expected:

- `200 OK`
- `likesCount` should not increase again for the same user.
- `likedByCurrentUser: true`

### Authenticated Unlike

```bash
TOKEN="<paste_access_token_here>"

curl -i -X DELETE "http://localhost:8080/api/blogs/$BLOG_ID/likes" \
  -H "Authorization: Bearer $TOKEN"
```

Expected:

- `200 OK`
- `likesCount` decreases by 1 if the user had liked the blog.
- `likedByCurrentUser: false`

### Idempotent Unlike

Run the same authenticated unlike command again.

Expected:

- `200 OK`
- `likesCount` should not go below `0`.
- `likedByCurrentUser: false`

## Frontend Detail Test

Run API mode:

```bash
cd frontend
NEXT_PUBLIC_BLOG_DATA_SOURCE=api npm run dev
```

Open a published blog detail:

```text
http://localhost:3000/blog/<slug>
```

### Guest UX

1. Logout.
2. Open blog detail.
3. Click the `Likes` metric in the `Details` box.

Expected:

- UI shows a sign-in toast.
- Network should not successfully create a like.
- If a request is forced without token, backend returns `401`.

### Login Like

1. Login.
2. Open blog detail.
3. Click the `Likes` metric.

Expected:

- Heart turns orange/filled.
- Label changes from `Likes` to `Liked`.
- Count increases immediately.
- Network request:
  - `POST /api/blogs/{blogId}/likes`
  - Status `200`
  - Has `Authorization: Bearer ...`

### Refresh Keeps Liked State

1. Like a blog.
2. Refresh the page.

Expected:

- Detail still shows `Liked`.
- Count is the backend value.

Note: the detail page first loads public data by slug, then refreshes liked state with authenticated `GET /api/blogs/{blogId}`.

### Unlike

1. While logged in and liked, click the heart again.

Expected:

- Heart returns to outline state.
- Label changes back to `Likes`.
- Count decreases immediately.
- Network request:
  - `DELETE /api/blogs/{blogId}/likes`
  - Status `200`
  - Has `Authorization: Bearer ...`

### Expired Token

1. Login.
2. Delete or corrupt `accessToken` in browser localStorage.
3. Try like/unlike.

Expected:

- UI rolls back optimistic state.
- Toast says sign-in session expired or like failed.
- Page does not crash.

## Regression

Check public blog still works:

```text
/blog
/blog/<slug>
```

Expected:

- Public list/detail still load without login.
- Public `GET /api/blogs/slug/{slug}` does not require token.
- Comment form from Phase 3 still works after login.

## Quality Checks

```bash
cd backend && ./gradlew :blog-service:test
cd backend && ./gradlew :api-gateway:compileJava
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
```
