## Context

The app is an Nx monorepo: `web` (Next.js 14 App Router, client-heavy, JWT in `sessionStorage`), `api` (Express 4 + Prisma 7 using the `@prisma/adapter-pg` driver adapter), and `shared` (Zod schemas). Today it runs locally: Postgres via docker-compose, avatars on the local filesystem, CORS reflecting any origin, and no production build/start/migrate scripts. Node 22, Yarn 4 (node-modules linker).

Constraints that shaped the design:

- Auth tokens live in `sessionStorage`, not cookies → cross-origin frontend/API split is painless (no CORS credentials, no SameSite).
- Prisma 7 uses the Rust-free driver adapter (`PrismaPg`), constructed manually in `apps/api/src/lib/prisma.ts` from a parsed URL — and currently **drops `sslmode`**, so hosted Postgres (which requires TLS) fails.
- Avatar storage is behind a `StorageProvider` interface (`save`/`delete`), but the only implementation writes to `process.cwd()/uploads/avatars` — ephemeral on any container host.
- Future plans (notifications: in-app, web push, email, scheduled jobs) favor a persistent, always-on API process over serverless functions.

## Goals / Non-Goals

**Goals:**

- Stand up a production environment where family/friends can use the app.
- Make the API connect to hosted Postgres over TLS without rewriting the ORM.
- Move avatar files to durable object storage (R2) behind the existing interface.
- Lock down CORS in production.
- Provide deterministic build/start/migrate commands for the host platforms.
- Keep the notification roadmap viable (persistent process, cron-capable host, static PWA-friendly frontend).

**Non-Goals:**

- Implementing notifications (in-app/push/email/cron) — this change only preserves the path.
- Buying a custom domain (use `*.vercel.app` + `*.up.railway.app` for now).
- CI/CD automation beyond what the hosts provide (Vercel git integration, Railway build/deploy).
- Multi-region, autoscaling, or observability beyond each platform's defaults.

## Decisions

### 1. Platform split: Vercel (web) + Railway (api) + Neon (Postgres) + Cloudflare R2 (avatars)

Chosen over the alternatives:

| Alternative                 | Rejected because                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Render for API              | Free tier sleeps after ~15 min idle (cold start 30–60s); free Postgres **expires after 30 days**.            |
| Vercel for API              | Long-running Express process doesn't fit serverless functions; notifications/real-time would fight it later. |
| Neon vs Render Postgres     | Neon free tier does not expire and has first-class Prisma 7 driver-adapter support.                          |
| Fly.io for API              | Viable but more ops surface; Railway gives the same always-on behavior with less setup.                      |
| Railway volumes for avatars | A volume pins avatars to one host; R2 is durable, portable, and egress-free.                                 |

Vercel Hobby allows **200 projects** (and 25 per git repo), non-commercial personal use — a family app qualifies.

### 2. DB connection: keep `@prisma/adapter-pg`, add TLS

Keep the existing driver adapter (rather than switching to `@prisma/adapter-neon`) to avoid dependency churn and stay portable across Postgres providers. The change is localized to `prisma.ts`:

- Parse the full `DATABASE_URL`, including the query string.
- When `sslmode=require` (or a dedicated `DATABASE_SSL=true` env) is present, pass `ssl: { rejectUnauthorized: false }` to `PrismaPg` (which forwards to the underlying `pg` pool).
- Use Neon's **pooled** connection string in production so the single long-running Node process doesn't hold excess idle connections.

**Alternative considered:** adopt `@prisma/adapter-neon` (websocket-based, no TLS flag needed). Rejected for now — it's a Neon-specific dependency and the `pg`-based adapter is sufficient for a single persistent process. Easy to revisit later.

### 3. Avatar storage: add `S3StorageProvider` behind the existing interface

- New `S3StorageProvider implements StorageProvider`, backed by `@aws-sdk/client-s3` (R2 is S3-compatible).
- Provider selection via `STORAGE_PROVIDER` env (`local` | `s3`), defaulting to `local` for dev/tests so existing specs and the hermetic e2e remain unchanged.
- S3 `save()` returns an **absolute public URL** (`${S3_PUBLIC_URL}/${key}`). The web already handles absolute URLs in `resolveAvatarUrl`, so no web change is required.
- `delete()` removes the object by key; keys encode the object path so the relative→absolute mapping is unambiguous.
- Config via `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PUBLIC_URL`.

### 4. CORS: environment-driven origin

- `apps/api/src/index.ts` reads `CORS_ORIGIN`; in production it becomes the single allowed `origin` (the Vercel URL). Dev/local continues to reflect `true`.

### 5. Production scripts + runtime contract

- Root `package.json` gains `"engines": { "node": "22" }`.
- Railway build command: `yarn nx build api && cd apps/api && npx prisma generate` (generate keeps the committed `src/generated` client from drifting; the `@nx/js:tsc` output lands at `dist/apps/api/apps/api/src/index.js` because `rootDir` is `"."`).
- Migrations run at deploy from the `apps/api` working directory — `prisma.config.ts` resolves `prisma/migrations` and the seed path relative to it, so running from repo root fails. Railway start command: `cd apps/api && npx prisma migrate deploy && cd ../.. && node dist/apps/api/apps/api/src/index.js`, with `DATABASE_URL` available to both build and runtime.
- Health check: `/health` (already exists) is registered as Railway's healthcheck path.

### 6. Environment variable matrix

| Var                                                                                                       | Where              | Notes                          |
| --------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------ |
| `DATABASE_URL`                                                                                            | Railway (+migrate) | Neon pooled, `sslmode=require` |
| `JWT_SECRET`                                                                                              | Railway            | new random secret              |
| `GOOGLE_CLIENT_ID`                                                                                        | Railway            | server-side token verification |
| `AI_API_KEY` / `AI_API_BASE_URL` / `AI_API_MODEL`                                                         | Railway            | server-side only               |
| `CORS_ORIGIN`                                                                                             | Railway            | Vercel production URL          |
| `STORAGE_PROVIDER`                                                                                        | Railway            | `s3`                           |
| `S3_ENDPOINT` / `S3_REGION` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_BUCKET` / `S3_PUBLIC_URL` | Railway            | R2 credentials                 |
| `NEXT_PUBLIC_API_BASE_URL`                                                                                | Vercel             | Railway API URL                |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`                                                                            | Vercel             | browser client ID              |

## Risks / Trade-offs

- **Ephemeral local storage during transition** → `STORAGE_PROVIDER` defaults to `local`, so dev/e2e/tests are untouched; only production flips to `s3`.
- **TLS misconfig breaks the API on boot** → mitigated by keeping the flag explicit (`sslmode=require`) and gating it behind env, not hardcoding `rejectUnauthorized: false` unconditionally.
- **`rejectUnauthorized: false` weakens TLS verification** → acceptable for Neon (which rotates certs behind a proxy); revisit with CA pinning if provider changes.
- **Two hosts = two failure domains** → acceptable at MVP; the frontend already degrades gracefully on API errors (toast/error screens), and `/health` gives host-level monitoring.
- **No custom domain** → Google OAuth origins must list `*.vercel.app`/`*.up.railway.app`; when a domain is purchased later, origins are updated in one place (Google Cloud Console).
- **R2 public URLs leak object keys** → acceptable for avatar images (public by design); the bucket holds no private data.
