## 1. Authorization helper

- [x] 1.1 Add `canViewRecipe(userId, recipeId)` predicate (author | public | group member) in `apps/api/src/lib/` with a unit test (api)
- [x] 1.2 Enforce visibility in `GET /v1/recipes/:id` → 404 for invisible recipes; add test (api)
- [x] 1.3 Enforce visibility in `POST /v1/recipes/:id/groups` (group membership + recipe visibility); add test (api)
- [x] 1.4 Enforce visibility in `POST /v1/groups/:id/recipes`; add test (api)
- [x] 1.5 Enforce visibility in `POST /v1/groups/:id/recipes/batch` (reject if any invisible); add test (api)

## 2. Auth hardening

- [x] 2.1 Add `hashToken(token)` (sha256 hex) to `utils/jwt.ts`; add test (api)
- [x] 2.2 Store `hashToken(refreshToken)` in auth login/register/refresh/google; lookup by hash in `/refresh` and logout (api)
- [x] 2.3 Fail fast on missing/placeholder `JWT_SECRET` outside test env; add test (api)
- [x] 2.4 Return 409 `account_conflict` on Google sign-in when a password account matches a different Google identity; add test (api)

## 3. Avatar upload path traversal

- [x] 3.1 Derive extension from a MIME allowlist; stop using `originalname`; add test for `../../` and `x.png/../../` (api)

## 4. Database TLS

- [x] 4.1 Change `ssl` to `{ rejectUnauthorized: true }`; update `dbConfig.spec.ts` (api)

## 5. Input validation & PII

- [x] 5.1 Validate `PATCH /v1/users/me/settings` with `userSettingsUpdateSchema`; add test (api)
- [x] 5.2 Bump `userSearchQuerySchema.email` to `.min(3)`; add test (shared)
- [x] 5.3 Verify invitee exists in `POST /v1/groups/:id/invitations` → 404; add test (api)

## 6. Pantry matching

- [x] 6.1 Replace substring match with whole-word boundary match in `isCovered`; add test (egg vs eggplant) (api)

## 7. Lint rules

- [x] 7.1 Add `eslint-plugin-security` dev dep and enable `detect-non-literal-fs-filename` (api)
- [x] 7.2 Add `no-restricted-syntax` rule banning `rejectUnauthorized: false` (api)

## 8. Verify

- [x] 8.1 Run `yarn verify` (lint + typecheck + test + build) (api, shared)
- [x] 8.2 Run `yarn verify:full` including hermetic e2e (api)
