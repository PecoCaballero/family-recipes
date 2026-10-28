## Why

A code review of the MVP-launch PR surfaced several API security and
correctness defects: two recipe-visibility IDORs (any authenticated user can
read another user's private recipe, or attach a private recipe to a group they
control), an avatar-upload path traversal (arbitrary file write), TLS
verification disabled on the production Postgres connection, refresh tokens
stored in plaintext, a JWT secret that silently falls back to a known dev
value, and unvalidated/sloppy input handling in several routes. None of these
are currently covered by tests or caught by lint, so the same classes of bug
will keep regressing. This change fixes them and adds tests + lint rules so
they cannot pass silently again.

## What Changes

- **Authorization**: enforce recipe visibility on `GET /v1/recipes/:id` and on
  every recipe-to-group sharing path (`POST /v1/groups/:id/recipes`,
  `POST /v1/groups/:id/recipes/batch`, `POST /v1/recipes/:id/groups`). A recipe
  may only be read or shared by someone who can see it (author, `public`, or
  group member). Sharing endpoints also require the acting user to be a group
  admin (group-side) or member (recipe-side).
- **Avatar upload**: stop deriving the stored filename from the client-supplied
  `originalname`; derive a safe extension from a server-side allowlist keyed on
  MIME type. Closes the path traversal.
- **Database TLS**: verify the Postgres server certificate in production
  (`rejectUnauthorized` is currently `false`).
- **Auth**: hash refresh tokens at rest (sha256) instead of storing them raw;
  fail fast at startup if `JWT_SECRET` is unset or the known placeholder in a
  non-test environment; do not silently rebind an existing password account's
  identity provider on Google sign-in without confirming the password.
- **Input validation**: validate `PATCH /v1/users/me/settings` against
  `userSettingsUpdateSchema`; require a 3-char minimum on the user email search
  to limit PII enumeration; verify the invitee exists when creating an
  invitation.
- **Pantry matching**: match ingredient names on whole-word boundaries instead
  of raw substring so `egg` no longer "covers" `eggplant`.
- **Testing & linting**: add Jest unit tests for every fix above, and enable
  `eslint-plugin-security` (including `detect-non-literal-fs-filename`) plus a
  custom rule blocking `rejectUnauthorized: false` so these classes of defect
  fail CI.

## Capabilities

### New Capabilities

<!-- None. All changes extend existing capabilities. -->

### Modified Capabilities

- `auth`: refresh tokens hashed at rest; JWT secret production guard; Google
  account-linking does not silently overwrite an existing identity.
- `database`: production TLS certificate verification.
- `avatar-upload`: filenames are server-generated and sanitized.
- `recipe-crud`: single-recipe retrieval and the recipe-side add-to-group
  endpoint enforce visibility/ownership.
- `groups-crud`: adding a recipe to a group requires the admin to be able to
  see that recipe.
- `bulk-recipe-share`: batch-add requires the admin to be able to see every
  recipe.
- `search-by-ingredients`: pantry coverage uses word-boundary matching.
- `profile-management`: settings update is schema-validated.
- `email-invitation`: user search requires a minimum query length; invitation
  creation verifies the invitee exists.

## Impact

- **Apps**: `api`, `shared`.
- **Code**: `apps/api/src/routes/{recipes,groups,users,invitations,auth,pantry}.ts`,
  `apps/api/src/lib/{storage,prisma,avatarUpload}.ts`,
  `apps/api/src/utils/jwt.ts`, `libs/shared/src/index.ts`,
  `apps/api/eslint.config.mjs` (or root flat config) + `eslint-plugin-security`,
  new/updated `*.spec.ts` beside sources.
- **Config**: `eslint-plugin-security` dependency; no schema change.
- **Migration**: none.
- **Verification**: `yarn verify` and `yarn verify:full` (API behavior changed;
  e2e must stay green).
