## Context

`shared` defines `recipeSchema` / `createRecipeInputSchema` /
`updateRecipeInputSchema` (`libs/shared/src/index.ts:33-69`) with no metadata
fields. The Prisma `Recipe` model likewise lacks them
(`apps/api/prisma/schema.prisma`), so any new field requires a migration — the
e2e DB is built solely from `prisma migrate deploy`, so drift surfaces there.
The API routes are `apps/api/src/routes/recipes.ts` and `groups.ts`. On the web,
invitation creation (`_hooks/groups.ts:188`) and remove-from-group
(`_hooks/groups.ts:92`) exist but have no UI; errors fall back to `window.alert`
(`_components/RecipeMenu.tsx`); privacy/notifications settings persist but have
no consumers.

## Goals / Non-Goals

**Goals:**

- Make advertised recipe metadata real end-to-end.
- Surface the two already-built actions (invite, remove-from-group).
- A single, consistent, non-blocking feedback mechanism.
- No setting presented without effect.

**Non-Goals:**

- No realtime/websocket notifications.
- No unit-system conversion or nutrition data.
- No new permissions model beyond existing admin/member rules.
- No email delivery work (invitation API behavior unchanged).

## Decisions

**D1. Metadata as nullable columns.**
`cuisine String?`, `prepTime Int?`, `cookTime Int?`, `servings Int?`,
`difficulty String?` on `Recipe`; mirrored as `.optional()` in
`recipeSchema`/create/update. Nullable keeps existing rows valid and the
migration reversible. `difficulty` as a Zod enum with a fixed set
(easy/medium/hard) stored as a string. Alternative: separate metadata table —
rejected (overkill for scalars).

**D2. Validation in `shared`, enforced by the API.**
Zod superRefine keeps `prepTime`/`cookTime`/`servings` positive integers and
`difficulty` in-range; the API returns the standard
`{ error: 'validation_error', details }`. Single source of truth across web and
api.

**D3. Toast via React context provider.**
Add a `ToastProvider` under `_providers` exposing `showToast(message, severity)`
backed by MUI `Snackbar`/`Alert`, mounted in the root layout. Replace
`window.alert`. Alternative: a library (notistack) — rejected to avoid a new
dependency.

**D4. Reuse existing hooks for UI actions.**
Wire `useCreateInvitation` into group settings (email field) and
`useRemoveRecipeFromGroup` into the group feed (with `ConfirmDialog`). No API
changes required for these two.

**D5. Settings resolution.**
Wire `notifications` to suppress non-error toasts. Hide any toggle with no
observable effect (e.g. `privacyLevel` if unused) rather than ship a no-op.
Prefer hiding in this change; wiring privacy can be deferred.

## Risks / Trade-offs

- **Migration drift** → add the migration and run `yarn verify:full`; columns
  are nullable so no backfill is needed.
- **Toast provider re-renders root tree** → keep it a small context with a
  stable callback; mount inside existing providers.
- **Hiding settings could surprise** → note it in the change summary; it
  satisfies the `mvp-readiness` "no deceptive stub UI" requirement.
- **Form growth** → make metadata collapsible/optional in `RecipeForm` so the
  primary flow stays short for older users.

## Migration Plan

1. Add metadata to `shared` schemas + tests.
2. Add Prisma columns + migration; update `recipes.ts` create/update/read.
3. Extend `RecipeForm` and recipe detail.
4. Add `ToastProvider`; replace `window.alert`.
5. Wire invite + remove-from-group UI.
6. Resolve settings (wire notifications, hide no-ops).
7. `yarn verify:full`.

Rollback: revert code and drop the nullable columns; no data loss for existing
recipes.

## Open Questions

- Exact `difficulty` values and labels (default easy/medium/hard)? Assume these.
- Is `privacyLevel` intended to gate anything at MVP, or hidden? (Default: hide.)
