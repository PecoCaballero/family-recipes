## Context

The API is Express 4 + Prisma 7 (Postgres) with JWT auth. A review of the
MVP-launch PR found security/correctness defects concentrated in
`apps/api/src/routes/*` and `apps/api/src/lib/*`. Key facts:

- Recipe visibility is already defined in specs as: author OR `visibility:
'public'` OR member of a group the recipe is in. `GET /v1/recipes` and
  `GET /v1/pantry/suggest` already apply it, but `GET /v1/recipes/:id` and the
  three add-to-group endpoints do not.
- `users.ts` `PATCH /me/settings` ignores the existing
  `userSettingsUpdateSchema` (libs/shared) and writes raw body to Prisma.
- `users.ts` avatar upload builds the filename from
  `req.file.originalname.split('.').pop()`.
- `prisma.ts` uses `ssl: { rejectUnauthorized: false }` when `sslmode=require`.
- `jwt.ts` falls back to `'dev-secret-change-in-production'`; refresh tokens are
  stored raw (`auth.ts` creates them, `jwt.ts` returns 48 random bytes hex).
- `auth.ts` `/google` rebinds an existing user's `provider`/`providerId` when
  the email matches, regardless of an existing `passwordHash`.
- `pantry.ts` `isCovered` uses bidirectional substring matching.
- `email-invitation` search allows 1-char queries; invitation creation does not
  verify the invitee exists.

Tests run via Jest (`apps/api/jest.config.cjs`, `*.spec.ts` beside sources).
Lint is ESLint flat config at the workspace root.

## Goals / Non-Goals

**Goals:**

- Close the two IDORs and the path traversal, and verify TLS.
- Store refresh tokens hashed and fail fast on a missing JWT secret.
- Validate all touched inputs; make pantry matching word-boundary-safe.
- Add unit tests that fail on the old behavior.
- Add lint rules that catch path traversal, plaintext-secret, and
  disabled-TLS-verification patterns so they can't regress.

**Non-Goals:**

- No schema/migration changes.
- No new dependencies beyond dev-time lint plugins.
- No changes to the web app (these are API-level defects; web already limits
  bulk-share to the user's own recipes).

## Decisions

**D1. Extract a shared `canViewRecipe(userId, recipeId)` helper.**
A single predicate (author OR public OR group-member) reused by `GET
/recipes/:id` and the three add-to-group endpoints. Alternative: inline checks
in each route — rejected (drift). The helper returns a boolean; routes map
`false` to 404.

**D2. Share endpoints require visibility, not ownership.**
An admin may share a recipe they can see (e.g. a `public` recipe, or one from a
group they're in), not only recipes they authored. This matches the visibility
predicate and the family-app intent. The recipe-side `POST /recipes/:id/groups`
requires group membership (any member may share into their group).

**D3. Avatar extension from a MIME allowlist.**
Map `mimetype` → extension (`image/jpeg`→`jpg`, `image/png`→`png`,
`image/webp`→`webp`, `image/gif`→`gif`), default to `png` for other `image/*`.
Never read `originalname`. This eliminates traversal and normalizes storage.

**D4. Hash refresh tokens with sha256.**
`jwt.ts` gains `hashToken(token)`. `auth.ts` stores `hashToken(refreshToken)`
on issue, and `/refresh` looks up by hash. `logout` also hashes before
`deleteMany`. Existing plaintext rows become unreachable; acceptable pre-launch
(no real users), noted in risks.

**D5. JWT secret guard at module load.**
`jwt.ts` throws if `NODE_ENV === 'production'` and `JWT_SECRET` is missing or
equals a known placeholder. Dev/test fall back to a dev secret so local tooling
is unaffected.

**D6. Google account-conflict 409.**
When a verified Google email matches a user with a `passwordHash` and a
different `providerId`/`provider`, return 409 `account_conflict`. Re-link only
when `provider === 'google' && providerId === sub`, or when the account has no
password.

**D7. Pantry exact-equality match.**
Normalize (trim/lowercase) and compare names for exact equality. This removes
all substring false positives (`egg`→`eggplant`, `milk`→`chocolate milk`) at
the cost of not matching near-synonyms/plurals — an acceptable, predictable
trade-off for a coverage heuristic.

**D8. Validation via existing shared schemas.**
`PATCH /me/settings` parses with `userSettingsUpdateSchema`. `userSearchQuerySchema`
bumps `email` to `.min(3)`. Invitation creation verifies the invitee exists.

**D9. Lint rules.**
Add `eslint-plugin-security` with
`security/detect-non-literal-fs-filename` (path traversal), and a
`no-restricted-syntax` rule that bans the literal `rejectUnauthorized: false`.
Do not enable noisy `detect-object-injection`.

## Risks / Trade-offs

- **Refresh-token hashing invalidates existing sessions** — acceptable now
  (pre-launch); any persisted dev token stops working after deploy.
- **`rejectUnauthorized: true` may break self-signed dev TLS** — local dev has
  no `sslmode`, so unaffected; hosted Neon/Postgres certs are publicly trusted.
- **Word-boundary/exact-equality matching may change suggestion results** — intended;
  the spec now documents exact-equality semantics; near-matches (plurals,
  synonyms) are treated as missing rather than falsely covered.
- **409 account-conflict changes Google UX for password users** — the web
  client must surface a new error string (tracked in tasks, web-owned but
  optional for this change's scope; a 409 already renders as a generic error).

## Migration Plan

1. Add `hashToken` + JWT secret guard (`utils/jwt.ts`); update `auth.ts`
   issue/lookup/logout paths.
2. Add `canViewRecipe` helper; enforce in `recipes.ts` (`GET /:id`, `POST
/:id/groups`) and `groups.ts` (`POST /:id/recipes`, batch).
3. Sanitize avatar extension in `users.ts` (MIME allowlist).
4. Verify TLS in `prisma.ts`.
5. Validate settings/search; verify invitee exists.
6. Word-boundary matching in `pantry.ts`.
7. Add unit tests + lint rules.
8. `yarn verify` then `yarn verify:full`.

Rollback: revert; no migration, so rollback is pure code.

## Open Questions

- Should the web login surface the new `account_conflict` error with a dedicated
  message? (Out of scope here; a generic error is acceptable.)
