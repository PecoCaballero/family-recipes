# MVP Launch

## Why

The app is feature-complete enough to put in front of family and friends, but it
still looks and feels raw: MUI-default blue/pink styling, no brand identity, a
generic tab layout that older users won't recognize, and several stubbed or
half-wired features (fake Google/Apple buttons, dead toggles, unexposed hooks,
missing recipe fields, i18n drift). Before sharing it, we want a polished,
confident MVP whose navigation feels immediately familiar to non-technical,
older users — deliberately close to WhatsApp's UI/UX — and whose advertised
features actually work.

This is the **umbrella change**: it defines the launch scope, acceptance
criteria, and the decomposition into focused changes. It implements no product
code itself; the sub-changes below do.

## What Changes

- Adopt a **WhatsApp-familiar visual language**: green brand palette, chat-style
  list rows, message-bubble recipe cards, larger typography and touch targets,
  light + dark parity, logo/app icon/PWA manifest.
- Restructure the primary lists (groups, recipes, group recipe view) into
  WhatsApp-style rows/feeds **without changing routes**.
- Finish or remove stubbed features: expose invitation + remove-from-group
  actions, add recipe metadata fields (cuisine, prep/cook time, servings,
  difficulty), add a global toast system, resolve non-functional privacy/
  notification toggles.
- Add **Google Sign-In** (email/password remains) and remove the fake Apple
  button.
- Close i18n gaps (missing keys in es/fr/de, unreachable German, hardcoded
  English strings) and do an accessibility pass.

**BREAKING**: none for end users. Internally, adding Google Sign-In requires a
Prisma schema change (`User.passwordHash` becomes nullable; new
`provider`/`providerId` columns) plus a migration.

## Capabilities

### New Capabilities

- `mvp-readiness`: Cross-cutting launch acceptance criteria — WhatsApp-familiar
  visual language, core journey completable unaided by an older user, and no
  deceptive stub UI presented as working.

### Modified Capabilities

<!-- None. Sub-changes introduce their own deltas (e.g. google-oauth modifies auth). -->

## Impact

- **Apps**: `web`, `api`, `shared` (all affected).
- **Sub-changes created by this umbrella** (each reviewed, implemented, and
  archived independently):
  1. `whatsapp-design-system` (web) — brand tokens, typography, touch targets,
     component restyle, logo/PWA, font + dead-Tailwind cleanup.
  2. `whatsapp-list-ux` (web) — chat-row groups list, bubble recipe cards,
     group recipe feed.
  3. `finish-mvp-features` (api, web, shared) — invitation UI,
     remove-from-group UI, recipe metadata fields, toast system, toggle
     resolution.
  4. `i18n-and-polish` (web) — locale parity, German picker, i18n of hardcoded
     strings, dedupe, a11y pass.
  5. `google-oauth` (api, web, shared) — schema migration, Google ID-token
     verification endpoint, web flow.
  6. `recipe-nesting` (api, web, shared) — parent/variation recipes: pick a
     parent in the form, show parent + variations on the detail page.
- **Dependencies**: Google OAuth Client ID + secret (env) required for
  `google-oauth`.
- **Verification**: `yarn verify` per change; `yarn verify:full` for
  `finish-mvp-features` and `google-oauth`.
