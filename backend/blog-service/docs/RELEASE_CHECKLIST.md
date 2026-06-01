# Blog Service Release Checklist

## Configuration
- Verify `blog-service/.env.example` includes all required vars.
- Verify `src/main/resources/application.properties` matches hardening settings:
  - multipart size limits
  - `blog.image.*` properties
- Ensure real deployment env provides all required values.

## Database
- Verify `main.sql` has:
  - `blog_posts` table with `public_id`
  - `blog_images` table and indexes
- Verify `seed-db/blog_service.sql` stays in sync with `main.sql` for blog schema.

## Quality Gates
Run from `backend`:

```bash
./gradlew :blog-service:spotlessCheck
./gradlew :blog-service:compileJava
./gradlew :blog-service:test
```

## API Verification (Smoke)
- Upload valid image files (`201`).
- Create and publish a blog (`201/200`).
- Upload invalid type file (`400`).
- Upload with forbidden role (`403`).

## Known Limitations
- Orphan image cleanup is best-effort and runs during upload/create/update flows.
- Integration tests against real Cloudinary are not part of unit test suite.

