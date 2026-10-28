## Context

`family-recipes` is an Nx monorepo (`web` Next.js 14 App Router + MUI, `api`
Express + Prisma 7 + Postgres, `shared` Zod schemas). The feature set for a
family MVP largely exists: auth, groups, members/admins, invitations (API),
recipes, sharing, profile/settings. The gaps before a family/friends launch are
presentational and finishing-work rather than net-new product:

- Styling uses MUI defaults (`_theme/theme.ts`: primary `#1976d2`), no brand
  identity, a theme/typography font mismatch (theme says "Geist", `layout.tsx`
  loads Inter), and a dead Tailwind install.
- Navigation is a generic 4-tab bottom nav; nothing signals "WhatsApp-like" to
  an older user.
- Stubs exist: fake Google/Apple buttons with hardcoded English errors,
  non-functional privacy/notification toggles, unused hooks
  (`useCreateInvitation`, `useRemoveRecipeFromGroup`), unused recipe metadata
  i18n keys.
- i18n drift: es/fr/de miss 22 `account.*` keys, German is unreachable in the
  language picker, and several strings are hardcoded English.

The target audience is older, non-technical family members, so familiarity and
clarity outrank novelty.

## Goals / Non-Goals

**Goals:**

- Ship a cohesive, branded, WhatsApp-familiar UI with personality.
- Make the core journey completable unaided by an older user.
- Ensure every visible affordance works (no deceptive stubs).
- Add Google Sign-In; keep the change reviewable and reversible.

**Non-Goals:**

- No realtime chat/messaging/inbox, presence, voice notes, or activity feed
  (visual/UX language only — routes and data model unchanged).
- No Apple Sign-In in this scope (deferred; needs Apple Developer account,
  Service ID, and domain association).
- No new product capabilities beyond finishing what is already modeled.
- No infrastructure/CI/deploy work.

## Decisions

**D1. Umbrella + focused sub-changes, not one mega-change.**
OpenSpec favors one feature per change and archiveable units. The umbrella
(`mvp-launch`) captures scope/acceptance and creates no product code; five
focused changes implement it. Alternative considered: a single large change —
rejected because it is hard to review, validate `--strict`, and archive
incrementally.

**D2. WhatsApp _visual language_, not the chat metaphor.**
Keep the existing routes and 4-tab shell; restyle lists to chat rows and
recipes to bubble cards, adopt the green palette, and enlarge type/touch
targets. Alternative considered: restructure into conversations/feeds — rejected
as a much larger build with new navigation and data concepts, orthogonal to the
"make it familiar" goal.

**D3. Palette = WhatsApp green, name unchanged (`Family Recipe`).**
Maximum familiarity; least design risk. Alternative: custom warm palette —
deferred, could be layered later on the same token system.

**D4. Google Sign-In only; remove the Apple button.**
Google has the lowest integration friction (ID-token verification, no domain
association). Apple requires an Apple Developer account + domain verification +
periodic secret rotation — not worth the MVP lead time. Schema: make
`passwordHash` nullable and add `provider`/`providerId`, with a migration
(required by the e2e DB which is built purely from migrations).

**D5. Verify each sub-change with `yarn verify`; `verify:full` where DB/API
behavior changes.** The umbrella itself is documentation-only and is validated
with `openspec validate mvp-launch --strict`.

## Risks / Trade-offs

- **Large green restyle could regress contrast/legibility** → check both light
  and dark modes; keep the design-token change isolated and testable.
- **Google OAuth needs credentials + a new schema migration** → isolate in its
  own change; gate on the user supplying Client ID/secret; ensure the e2e
  migration path applies cleanly.
- **Sub-changes touching the same components (design-system then list-ux) may
  conflict if run in parallel** → sequence design-system before list-ux.
- **Removing toggles may be seen as a regression** → prefer wiring where cheap
  (notifications = toast preference), otherwise hide rather than ship a no-op.
- **Umbrella drift** → umbrella tasks reference sub-change names; sub-changes
  own their own specs/tasks.

## Migration Plan

1. Create and implement `whatsapp-design-system`.
2. Implement `whatsapp-list-ux` (builds on the tokens).
3. Implement `finish-mvp-features`.
4. Implement `i18n-and-polish`.
5. Implement `google-oauth` (schema migration + seed-safe e2e).
6. Archive each sub-change, then archive `mvp-launch`.

Rollback: each change is independently revertible; the only data-model change is
`google-oauth`, whose migration adds nullable columns (safe to reverse).

## Open Questions

- Where do Google OAuth credentials live per environment, and what redirect URIs
  are registered for localhost and the launch domain? (Owner: user.)
- Are notifications expected to have any observable effect at MVP (e.g. a
  toast), or should the toggle be hidden? (Default: hide if not wired.)
