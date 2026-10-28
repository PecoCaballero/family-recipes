## Why

The app is feature-complete (the MVP umbrella and its sub-changes are archived) but still only runs locally against a dockerized Postgres with avatar files on the local filesystem. Family and friends can't use it. We need a production deployment now, architected so the already-planned notification features (in-app, web push, email, scheduled jobs) slot in without re-platforming.

## What Changes

- Deploy `web` to **Vercel** (Hobby) and `api` to **Railway** (Hobby, always-on), with **Neon** for Postgres and **Cloudflare R2** for avatar object storage.
- **API**: add TLS/SSL support to the Prisma driver-adapter connection so it works against hosted Postgres (today it parses `DATABASE_URL` and silently drops `sslmode`).
- **API**: add an S3-compatible storage provider behind the existing `StorageProvider` interface, selectable by env; return absolute public avatar URLs instead of relative `/uploads/...` paths.
- **API**: restrict CORS `origin` via an env var (today it reflects any origin).
- Add production build/start/migrate scripts and a Node 22 engine declaration.
- **Infra/config**: env-var matrix, Neon `migrate deploy` + seed, R2 bucket + credentials, Google OAuth authorized origins for the deployed domains.
- Notifications are **not** implemented here, but the platform choices (persistent API + cron-capable host + service-worker-friendly static frontend) keep the path open.

No breaking changes for end users.

## Capabilities

### New Capabilities

- `production-deployment`: A deployable production environment for web + api across Vercel/Railway/Neon/R2 — configuration via environment variables, migrations applied at deploy, health check endpoint, CORS policy, and SSL-secured database connections.

### Modified Capabilities

- `avatar-upload`: Avatar files move from local filesystem + static middleware to S3-compatible object storage (R2); the storage provider is selected by environment, and absolute public URLs are returned.

## Impact

- **Apps**: `api` (`prisma.ts`, `storage.ts`, `users.ts`, `index.ts`), `web` (env config only). `shared`: none.
- **Dependencies**: add `@aws-sdk/client-s3` for S3-compatible storage.
- **Systems**: Vercel, Railway, Neon, Cloudflare R2, Google Cloud Console (OAuth origins).
- **Environment variables**: new `CORS_ORIGIN`, `S3_*`, `STORAGE_PROVIDER`, plus existing `DATABASE_URL`/`JWT_SECRET`/`GOOGLE_CLIENT_ID`/`AI_*` wired to hosted values. See design.md for the full matrix.
