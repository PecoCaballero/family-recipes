## 1. Data model

- [ ] 1.1 Make `User.passwordHash` nullable and add `provider`/`providerId` with a unique index (api)
- [ ] 1.2 Generate and apply the Prisma migration (api)

## 2. Shared schemas

- [ ] 2.1 Add `googleAuthInputSchema` (and any response additions) to `shared` with tests (shared)

## 3. API

- [ ] 3.1 Add `google-auth-library` and verify ID tokens with `GOOGLE_CLIENT_ID` (api)
- [ ] 3.2 Implement `POST /v1/auth/google` with find-or-create and the standard auth response (api)
- [ ] 3.3 Harden `POST /v1/auth/login` for accounts without a password (api)
- [ ] 3.4 Add `GOOGLE_CLIENT_ID` to `.env.example` and document setup (api)

## 4. Web

- [ ] 4.1 Integrate Google Identity Services and wire the "Continue with Google" button to the new endpoint (web)
- [ ] 4.2 Remove the fake Apple button and its i18n keys; add Google flow keys to all five locales (web)

## 5. Verify

- [ ] 5.1 Run `yarn verify:full` including a Google sign-in e2e happy path (api, web, shared)
