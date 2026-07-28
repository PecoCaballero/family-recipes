## Why

The backend currently uses in-memory arrays that reset on restart and has no real authentication. All 18 API endpoints exist as scaffold but cannot support real users. The frontend has a fully built UI (14 pages, recipes, groups, account, i18n, themes) but every data source is mock. This change installs the foundation: real database, real auth, and connects the frontend to the API.

This is Phase 1 of the build-out:

| Phase                            | Scope                                                            | Status            |
| -------------------------------- | ---------------------------------------------------------------- | ----------------- |
| **Phase 1: Backend Foundation**  | PostgreSQL + Prisma, JWT auth, recipe CRUD, frontend integration | **← this change** |
| Phase 2: Groups & Sharing        | Group CRUD, membership, recipe visibility, send-to-group         | planned           |
| Phase 3: User Profile & Settings | Avatar upload, settings persistence, account deletion            | planned           |
| Phase 4: Search & Discovery      | Full-text search, public recipe discovery, filters               | planned           |

## What Changes

- Add PostgreSQL database with Prisma ORM to `apps/api`
- Replace in-memory `data.ts` with Prisma Client queries
- Implement real JWT authentication (bcrypt password hashing, access/refresh tokens)
- Add auth middleware to protect all authenticated routes
- Connect frontend API calls (`apps/web`) to real backend endpoints
- Add `AuthContext` and token management to the frontend
- Remove mock delays and console.log stubs from all scenes
- Update shared types to add `passwordHash` (server-side only) and `refreshTokens` table

## Capabilities

### New Capabilities

- `database`: PostgreSQL schema via Prisma — users, recipes, ingredients, groups, refresh_tokens, and junction tables for saved recipes and group membership
- `auth`: User registration with password hashing, login with JWT access/refresh token pair, token refresh endpoint, logout with token revocation, auth middleware guarding all `/v1/*` routes except health and auth endpoints
- `recipe-crud`: Recipe create/read/update/delete with database persistence, author-only edit/delete enforcement, save/unsave toggle, compute `isAuthor`/`isSaved` from authenticated user context

### Modified Capabilities

<!-- No existing specs to modify. All are new capabilities. -->

## Impact

- **apps/api**: New dependencies (Prisma, bcrypt, jsonwebtoken, cookie-parser). Replace `data.ts` with Prisma client. Add auth middleware. Update all route handlers from in-memory to DB queries.
- **apps/web**: New `AuthContext` provider. Replace all mock/stub API calls with real `fetch` calls. Add token storage and auto-refresh.
- **libs/shared**: Add `LoginInput`, `RegisterInput`, `TokenPair` types. Remove computed `isAuthor`/`isSaved` from Recipe type (now server-computed).
- **Infrastructure**: Requires PostgreSQL instance (local dev via Docker, production via Supabase/Neon).
