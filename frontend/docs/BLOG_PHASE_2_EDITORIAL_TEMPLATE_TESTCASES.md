# Blog Phase 2 Editorial Template Testcases

## Scope

Phase 2 moves `Use editorial template` from a local frontend helper to a backend-driven feature.

Included:

- `GET /api/blogs/editorial-templates`
- `GET /api/blogs/editorial-templates/{key}`
- `POST /api/blogs/editorial-templates/{key}/render`
- Create/Edit UI lets the author choose a template.
- `Use selected template` calls backend render API.
- Saving a post sends `templateKey` and `templateVersion` when a rendered template was inserted.

Not included:

- AI generation.
- Comments, likes, views.
- Backend-side search/filter migration.

## Backend API Test

List templates:

```bash
curl "http://localhost:8080/api/blogs/editorial-templates"
```

Expected:

- Response is `200 OK`.
- Response contains at least:
  - `food_editorial`
  - `restaurant_guide`
  - `menu_strategy`
- Each template has `name`, `description`, `sections`, `defaultContent`, and `qualityRules`.

Get one template:

```bash
curl "http://localhost:8080/api/blogs/editorial-templates/food_editorial"
```

Expected:

- Response is `200 OK`.
- `key` is `food_editorial`.
- `qualityRules.length > 0`.

Render requires login as `ADMIN` or `MERCHANT`.

```bash
TOKEN="<admin-or-merchant-access-token>"

curl -X POST "http://localhost:8080/api/blogs/editorial-templates/menu_strategy/render" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Better Lunch Menu Flow",
    "topic": "Better Lunch Menu Flow",
    "language": "en",
    "category": "Menu Strategy"
  }'
```

Expected:

- Response is `200 OK`.
- Response has `content`.
- `templateKey` is `menu_strategy`.
- `templateVersion` is present.
- `content` contains markdown headings.

Unauthorized check:

```bash
curl -i -X POST "http://localhost:8080/api/blogs/editorial-templates/menu_strategy/render" \
  -H "Content-Type: application/json" \
  -d '{"title":"No Token","topic":"No Token"}'
```

Expected after gateway restart with Phase 2 code:

- Response is `401 Unauthorized`.

## Frontend Create Test

Open:

```text
http://localhost:3000/blog/create
```

Precondition:

- Logged in as `ADMIN` or `MERCHANT`.

Steps:

1. Enter title: `Phase 2 Template Create Test`.
2. Enter category: `Menu Strategy`.
3. Choose template `Menu Strategy`.
4. Click `Use selected template`.
5. If confirm appears, accept replace.
6. Verify markdown editor is filled with backend-rendered content.
7. Save as Draft.

Expected:

- Button shows loading state while rendering.
- Content is inserted from backend API, not local helper.
- Draft is created successfully.
- Reopen edit page for the draft and verify selected template is retained if backend returned `templateKey`.

## Frontend Edit Test

Open an existing draft/published post in edit mode.

Steps:

1. Choose a different template, for example `Restaurant Guide`.
2. Click `Use selected template`.
3. Confirm replace.
4. Save.
5. Reopen the same edit page.

Expected:

- Content changes to the selected backend-rendered structure.
- Save succeeds.
- `templateKey/templateVersion` are persisted in API response.

## Regression Checks

- Create/Edit still works if the user never uses a template.
- Existing content is not replaced unless the confirm dialog is accepted.
- If templates fail to load, the editor still works manually.
- Public `/blog` and `/blog/[slug]` still load normally.

## Quality Checks

```bash
cd backend && ./gradlew :blog-service:test
cd backend && ./gradlew :api-gateway:compileJava
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
```
