# Google OAuth

## Why

The login screen shows Google and Apple buttons that are not real — they show a
hardcoded "not yet available" error (`LoginScene.tsx`). For a family/friends
launch, a one-tap Google sign-in dramatically lowers friction for older,
non-technical users. Apple is deferred (requires an Apple Developer account,
Service ID, and domain association). This change implements Google Sign-In and
removes the fake Apple button.

## What Changes

- Add a **Google Sign-In** endpoint to the API that verifies a Google ID token
  and returns the standard `{ accessToken, refreshToken, user }` response.
- Extend the `User` model with `provider` and `providerId` and make
  `passwordHash` nullable, so an OAuth-only user has no password. Requires a
  Prisma migration.
- Wire the web login (and registration) Google button to Google Identity
  Services and call the new endpoint; **remove the fake Apple button**.
- Add shared schemas for the OAuth request/response.
- Add i18n keys in all five locales and env config for the Google Client ID.

## Capabilities

### New Capabilities

<!-- None; Google sign-in extends the existing auth capability. -->

### Modified Capabilities

- `auth`: adds Google Sign-In as an authentication method and clarifies
  behavior for accounts without a password.

## Impact

- **Apps**: `api`, `web`, `shared`.
- **Code**: `apps/api/prisma/schema.prisma` (+ migration),
  `apps/api/src/routes/auth.ts`, `libs/shared/src/index.ts`,
  `apps/web/src/app/_scenes/LoginScene.tsx` (and/or a Google button component),
  `apps/web/src/app/_i18n/locales/*.json`, `.env`/`.env.example`.
- **Config**: `GOOGLE_CLIENT_ID` (api, to verify audience) and the web client ID
  (web). No client secret is strictly required for ID-token verification.
- **Migration**: yes — nullable `passwordHash` + new columns. e2e DB is built
  from migrations, so this must apply cleanly.
- **Verification**: `yarn verify:full`.
