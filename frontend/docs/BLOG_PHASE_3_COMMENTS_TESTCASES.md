# Blog Phase 3 Comments Testcases

## Scope

Phase 3 turns Blog Detail comments into a real API-backed feature.

Included:

- Public `GET /api/blogs/{blogId}/comments?page=&size=&sort=`.
- Authenticated `POST /api/blogs/{blogId}/comments`.
- Frontend API mode loads comments from backend.
- `Share Your Thoughts` submits to backend only for signed-in users.
- Field-level validation remains in the form.
- Reply/nested comments are hidden for now because backend does not support replies yet.

Not included:

- Comment moderation dashboard.
- Nested replies.
- Email follow-up delivery.
- Live comment count sync in the detail sidebar without page refresh.
- Guest/anonymous comments.

## Backend API Test

First get a published blog id:

```bash
curl "http://localhost:8080/api/blogs?page=0&size=1&sort=publishedAt,desc"
```

Copy `content[0].id` as `BLOG_ID`.

List comments:

```bash
curl "http://localhost:8080/api/blogs/$BLOG_ID/comments?page=0&size=2&sort=createdAt,desc"
```

Expected:

- `200 OK`
- Response is a Spring page.
- `content` may be empty if no comments exist.

Create authenticated comment:

```bash
TOKEN="<paste_access_token_here>"
curl -X POST "http://localhost:8080/api/blogs/$BLOG_ID/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "This is a real comment from the Phase 3 API test.",
    "notify": false
  }'
```

Expected:

- `201 Created`
- Response has `id`, `blogId`, `authorId`, `name`, `message`, `status: PUBLISHED`, `createdAt`.
- `email` is not exposed in the public comment response.

Guest create check:

```bash
curl -i -X POST "http://localhost:8080/api/blogs/$BLOG_ID/comments" \
  -H "Content-Type: application/json" \
  -d '{"message":"Anonymous comment should not be accepted.","notify":false}'
```

Expected:

- `401 Unauthorized`

Validation check:

```bash
TOKEN="<paste_access_token_here>"
curl -i -X POST "http://localhost:8080/api/blogs/$BLOG_ID/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":""}'
```

Expected:

- `400 Bad Request`

Gateway note:

- Restart `api-gateway` after Phase 3 because comment create is now authenticated.
- `GET /comments` stays public and should not require a token.
- `POST /comments` must send a valid token.

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

Expected:

- Comments section loads from backend.
- If no comments exist, shows empty state.
- Pagination shows `01 / NN` when there is more than one page.
- Reply button is not shown.
- If signed out, the form shows `Sign in to comment`.

Submit comment:

1. Sign in.
2. Confirm the form says `Commenting as ...`.
3. Fill `Message`.
4. Click `Send Message`.

Expected:

- Button shows `Sending...`.
- Success text says `Your comment was posted.`
- New comment appears on page 1.
- Refresh the page, comment still exists.

Validation:

1. Sign in.
2. Clear message.
2. Submit.

Expected:

- The message field shows its own red inline error.
- No generic bottom-only error.

## Mock Mode Regression

Run mock mode:

```bash
cd frontend
NEXT_PUBLIC_BLOG_DATA_SOURCE=mock npm run dev
```

Expected:

- Detail still shows seeded mock comments.
- Signed-out users still see the sign-in prompt.
- Signed-in users can submit a local-only preview comment.
- No backend API is required in mock mode.

## Quality Checks

```bash
cd backend && ./gradlew :blog-service:test
cd backend && ./gradlew :api-gateway:compileJava
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
```
