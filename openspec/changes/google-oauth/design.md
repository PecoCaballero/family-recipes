## Context

Auth today is email/password only. `apps/api/src/routes/auth.ts` (208 lines)
hashes with bcrypt (`SALT_ROUNDS = 12`) and issues JWT access + DB-stored
refresh tokens. The `User` model requires `passwordHash` and has no OAuth
fields (`apps/api/prisma/schema.prisma`). `LoginScene.tsx` renders fake Google
(`:37-49`) and Apple (`:51-63`) buttons with hardcoded English errors. No
Google/OAuth code or env config exists anywhere. The e2e DB is built purely from
`prisma migrate deploy`, so schema changes must ship with a migration.

## Goals / Non-Goals

**Goals:**

- Working Google Sign-In for new and existing users.
- Minimal, safe schema change (nullable password, provider identity).
- Remove deceptive Apple button.

**Non-Goals:**

- No Apple Sign-In.
- No account-linking UI (link Google to a password account from settings) —
  only implicit linking by matching verified email.
- No social profile data sync beyond name/email/avatar basics.
- No changes to refresh-token mechanics.

## Decisions

**D1. Verify Google ID tokens server-side.**
Use the `google-auth-library` `OAuth2Client.verifyIdToken` with
`GOOGLE_CLIENT_ID` as audience. Alternative: `passport-google-oauth20`
(redirect flow) — rejected; the ID-token (Google Identity Services) flow needs
no server-side redirect handling and fits an SPA. New dependency: `google-auth-library`.

**D2. Model identity, not a session.**
Add `provider String?` and `providerId String?` to `User`, with a unique
constraint on `(provider, providerId)`; make `passwordHash String?`. Existing
email users keep `provider = null`. Alternative: a separate `Account` table —
rejected as overkill for a single provider at MVP.

**D3. Find-or-create by verified email, then link.**
If the Google email matches an existing user, link (`provider='google'`,
`providerId=sub`) rather than erroring. Google returns verified emails; treat
that as sufficient for a family app. Alternative: require explicit linking —
rejected (adds friction for the target audience).

**D4. Nullable password guard.**
`login` must handle `passwordHash === null` by returning `invalid_credentials`
(fast path) so OAuth-only accounts can't be entered via password.

**D5. Same response contract.**
The Google endpoint returns the identical `AuthResponse` and stores a refresh
token, so the web client's auth context and API client are unchanged.

**D6. Web integration.**
Load Google Identity Services, render the official button, obtain the ID token,
and POST it to `/v1/auth/google`. Keep the existing email/password form intact;
delete the Apple button and its i18n strings.

## Risks / Trade-offs

- **Migration changes a non-nullable column** → making `passwordHash` nullable
  is backward-compatible (no data rewrite); test via e2e from migrations.
- **Audience/issuer misconfiguration** → 401s; document `GOOGLE_CLIENT_ID` in
  `.env.example` and fail loudly at startup if unset in non-test envs.
- **Email-based linking could merge an unintended account** → acceptable for
  MVP with verified emails; document the assumption.
- **New dependency** → `google-auth-library` is well-maintained; scope to the
  auth route.
- **Credentials dependency** → blocked until the user provides a Google OAuth
  Client ID and registered redirect/origin URIs.

## Migration Plan

1. Add `provider`/`providerId` (+ unique index) and make `passwordHash`
   nullable; generate and apply the migration.
2. Add shared schemas (`googleAuthInputSchema`).
3. Implement `POST /v1/auth/google` with token verification + find-or-create.
4. Harden `login` for null passwords.
5. Add `GOOGLE_CLIENT_ID` to env/`.env.example`; document setup.
6. Wire the web Google button; remove the Apple button + keys.
7. `yarn verify:full`.

Rollback: revert code; the migration only relaxes constraints/adds nullable
columns, so it is safe to reverse.

## Open Questions

- Which redirect/origin URIs are registered for localhost and the launch
  domain, and where will secrets live per environment? (Owner: user.)
- Should Google-created users be prompted to set a password later? (Default:
  no — Google remains their method.)
