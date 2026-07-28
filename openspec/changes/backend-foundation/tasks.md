## 1. Project Setup

- [ ] 1.1 Install backend dependencies: `prisma`, `@prisma/client`, `bcrypt`, `jsonwebtoken`, `uuid` in `apps/api` (api)
- [ ] 1.2 Install dev dependencies: `@types/bcrypt`, `@types/jsonwebtoken`, `@types/uuid` in `apps/api` (api)
- [ ] 1.3 Create `docker-compose.yml` at project root with PostgreSQL 16 container (port 5432, db: `family_recipes`, user: `postgres`, password: `postgres`) (infra)
- [ ] 1.4 Create `.env.example` with `DATABASE_URL` and `JWT_SECRET` (shared)

## 2. Database Schema

- [ ] 2.1 Run `npx prisma init` in `apps/api` to create `prisma/schema.prisma` and `.env` (api)
- [ ] 2.2 Define Prisma schema with tables: User, Recipe, Ingredient, SavedRecipe, RefreshToken, Group, GroupMember, RecipeGroup — following `specs/database/spec.md` (api)
- [ ] 2.3 Run `prisma migrate dev --name init` to apply schema and generate client (api)
- [ ] 2.4 Create `apps/api/src/lib/prisma.ts` — single PrismaClient instance, export as singleton (api)
- [ ] 2.5 Verify: start PostgreSQL via Docker, run migration, confirm tables exist via `psql` or Prisma Studio (api/infra)

## 3. Auth Implementation

- [ ] 3.1 Create `apps/api/src/middleware/auth.ts` — JWT verification middleware, extract `userId` from `sub` claim, attach to `req` (use Express `Request` augmentation) (api)
- [ ] 3.2 Create `apps/api/src/utils/jwt.ts` — `generateAccessToken(userId)`, `generateRefreshToken()`, `verifyAccessToken(token)` functions (api)
- [ ] 3.3 Rewrite `apps/api/src/routes/auth.ts` — POST `/register`: validate input, hash password, create user+tokens, return AuthResponse. POST `/login`: find user, compare password, create tokens, return AuthResponse (api)
- [ ] 3.4 Add POST `/v1/auth/refresh` — validate refresh token against DB, rotate tokens, return new pair (api)
- [ ] 3.5 Rewrite POST `/v1/auth/logout` — require auth, delete refresh token from DB (api)
- [ ] 3.6 Wire auth middleware into `apps/api/src/index.ts` — protect all `/v1/*` routes except `/v1/auth/*` and `/health` (api)
- [ ] 3.7 Test auth flow manually: register → login → access protected route → refresh token → logout → verify token revoked (api)

## 4. Recipe CRUD with Database

- [ ] 4.1 Rewrite `apps/api/src/routes/recipes.ts` — replace all in-memory logic with Prisma queries (api)
- [ ] 4.2 POST `/v1/recipes`: create Recipe + Ingredients in transaction, set `authorId` from `req.userId` (api)
- [ ] 4.3 GET `/v1/recipes`: query DB with optional `?search=` filter (name, description, ingredient name ILIKE), include computed `isAuthor`/`isSaved` (api)
- [ ] 4.4 GET `/v1/recipes/:id`: single recipe with ingredients, nested recipes, computed fields. Return 404 if not found (api)
- [ ] 4.5 PATCH `/v1/recipes/:id`: verify `authorId === req.userId`, update recipe + replace ingredients in transaction. Return 403 if not author (api)
- [ ] 4.6 DELETE `/v1/recipes/:id`: verify `authorId === req.userId`, delete recipe + cascade. Return 204 (api)
- [ ] 4.7 POST `/v1/recipes/:id/save` and `/v1/recipes/:id/unsave`: upsert/delete SavedRecipe rows, idempotent (api)
- [ ] 4.8 Remove `apps/api/src/data.ts` — all data now from database (api)

## 5. Shared Types Update

- [ ] 5.1 Update `libs/shared/src/index.ts`: make `isAuthor` and `isSaved` clearly optional (already marked with `?`, add JSDoc noting they are server-computed) (shared)
- [ ] 5.2 Add new types: `LoginInput { email, password }`, `RegisterInput { name, email, password }`, `TokenPair { accessToken, refreshToken }` (shared)
- [ ] 5.3 Update any frontend mock data that relies on `authorId`/`groupIds`/`savedByIds` being required. Fix LSP errors in `apps/web/src/app/__mocks__/recipes.ts` and `groups.ts` (shared, web)

## 6. Frontend API Integration

- [ ] 6.1 Create `apps/web/src/app/_providers/AuthContext.tsx` — React context with `user`, `tokens`, `login()`, `register()`, `logout()`, `isAuthenticated` (web)
- [ ] 6.2 Create `apps/web/src/app/_utils/apiClient.ts` — fetch wrapper that attaches `Authorization: Bearer` header and handles 401 → token refresh → retry (web)
- [ ] 6.3 Update `LoginScene.tsx`: replace mock delay with real `POST /v1/auth/login`, store tokens in AuthContext, handle errors (web)
- [ ] 6.4 Update `RegisterScene.tsx`: replace mock delay with real `POST /v1/auth/register`, store tokens in AuthContext, handle validation errors (web)
- [ ] 6.5 Update `AccountScene.tsx`: load user from `GET /v1/users/me` (or AuthContext), replace hardcoded stats, wire logout to real endpoint (web)
- [ ] 6.6 Update recipe pages: replace mock data with `GET /v1/recipes`, `POST /v1/recipes`, `PATCH`, `DELETE` calls. Wire save/unsave to real endpoints (web)
- [ ] 6.7 Add auth guards: redirect unauthenticated users from `/recipes`, `/groups`, `/search`, `/user` to `/login` using AuthContext (web)
- [ ] 6.8 Remove all mock imports (`__mocks__/recipes`, `__mocks__/groups`) from pages after API integration verified (web)

## 7. Verification & Cleanup

- [ ] 7.1 End-to-end manual test: register → create recipe → list recipes → view recipe → edit recipe → save recipe → delete recipe → logout (full)
- [ ] 7.2 Verify all existing frontend pages still render without errors after removing mocks (web)
- [ ] 7.3 Run `npx nx run api:lint` and `npx nx run web:lint` — fix any new lint errors (full)
- [ ] 7.4 Run `npm run format` to ensure all new code matches Prettier config (full)
