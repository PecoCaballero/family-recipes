## 1. Dependencies and runtime contract

- [x] 1.1 Add `@aws-sdk/client-s3` to `apps/api` dependencies (api)
- [x] 1.2 Add `"engines": { "node": "22" }` to root `package.json` (api)
- [x] 1.3 Add an API start script (`node dist/apps/api/apps/api/src/index.js`) to `apps/api/package.json` (api)

## 2. Database TLS support

- [x] 2.1 Update `apps/api/src/lib/prisma.ts` to parse `sslmode` from `DATABASE_URL` and pass `ssl` to the `PrismaPg` adapter when TLS is required (api)
- [x] 2.2 Add a unit spec covering sslmode=require → TLS enabled, and no-sslmode → no TLS (api)
- [x] 2.3 Run `nx typecheck api` + `nx test api` (api)

## 3. S3-compatible avatar storage

- [x] 3.1 Implement `S3StorageProvider` (implements `StorageProvider`) in `apps/api/src/lib/storage.ts`, returning absolute public URLs (api)
- [x] 3.2 Add provider selection by `STORAGE_PROVIDER` env (default `local`) and expose a factory/selector (api)
- [x] 3.3 Wire `apps/api/src/routes/users.ts` to use the selected provider (api)
- [x] 3.4 Add unit specs for `S3StorageProvider` save/delete + provider selection (mock the S3 client) (api)
- [x] 3.5 Run `nx test api` and confirm existing avatar + e2e flows still pass with `local` default (api)

## 4. CORS restriction

- [x] 4.1 Update `apps/api/src/index.ts` to read `CORS_ORIGIN` and restrict `origin` when set (api)
- [x] 4.2 Run `nx typecheck api` (api)

## 5. Infrastructure provisioning

- [x] 5.1 Create a Neon project and provision a pooled `DATABASE_URL` (infra)
- [ ] 5.2 Create a Cloudflare R2 bucket with API tokens and note `S3_*` values (infra)
- [ ] 5.3 Create a Railway service (root `apps/api`, Node 22) with build `yarn nx build api && cd apps/api && npx prisma generate` and start `cd apps/api && npx prisma migrate deploy && cd ../.. && node dist/apps/api/apps/api/src/index.js`, healthcheck `/health` (infra)
- [x] 5.4 Run `prisma migrate deploy` + `prisma db seed` against Neon once (infra)
- [ ] 5.5 Import the repo into Vercel with root `apps/web` and confirm Nx build auto-detection (infra)
- [ ] 5.6 Add the Vercel + Railway domains as authorized JS origins/redirect URIs in Google Cloud Console (infra)

## 6. Environment variable wiring

- [ ] 6.1 Set API env vars on Railway: `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `AI_API_KEY`/`AI_API_BASE_URL`/`AI_API_MODEL`, `CORS_ORIGIN`, `STORAGE_PROVIDER=s3`, `S3_*` (infra)
- [ ] 6.2 Set web env vars on Vercel: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (infra)
- [x] 6.3 Document the full env-var matrix in `.env.example` (api, web)

## 7. End-to-end verification

- [ ] 7.1 Confirm `GET /health` returns 200 on the deployed API (infra)
- [ ] 7.2 Register, log in, create a recipe, and share it end-to-end against the deployed services (infra)
- [ ] 7.3 Upload, replace, and remove an avatar; confirm it persists across a Railway redeploy (infra)
- [x] 7.4 Run `yarn verify` locally to confirm no regressions (api, web, shared)
