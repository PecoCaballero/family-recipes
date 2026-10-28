## Context

Five locale files live in `apps/web/src/app/_i18n/locales/` and are registered
in `_i18n/config.ts`. `en` and `pt` have 186 keys; `es`/`fr`/`de` have 164 —
each missing 22 `account.*` keys. `AccountScene.tsx` hardcodes a four-item
language list (no `de`). Hardcoded English appears in `LoginScene`,
`RegisterScene`, `RecipeForm`, `IngredientsList`, `not-found.tsx`, and
`GenericErrorScreen` fallbacks. `en.json` has duplicate keys
(`groups.leaveGroup`/`deleteGroup`, `deleteConfirmMessage`). On a11y: several
`IconButton`s lack `aria-label` (recipe overflow `recipes/[id]/page.tsx`,
ingredient edit/delete, avatar upload), and there is no focus-visible styling or
skip link.

## Goals / Non-Goals

**Goals:**

- Five locales, identical key sets, no fallback gaps.
- Every UI string translated; German selectable.
- Automated parity guard.
- Labeled controls, visible focus, skip link.

**Non-Goals:**

- No new locales.
- No RTL support.
- No professional translation beyond completing the missing `account.*` keys
  (assume reasonable native translations).
- No visual redesign (that is the design-system change).

## Decisions

**D1. Parity test over tooling.**
Add a Jest spec that flattens each locale and asserts key-set equality with
`en`; it fails on drift. Alternative: a lint rule or external service —
rejected (heavier, and the test is sufficient).

**D2. Source language picker from the config.**
Derive the picker options from the locales registered in `_i18n/config.ts` so a
new locale can't be forgotten again. Keep native display names.

**D3. Internationalize by adding keys, not literals.**
Every hardcoded string becomes a key present in all five locales. Placeholders
and helper text use i18n keys; error fallbacks use keys with `en` fallback only
as a last resort.

**D4. A11y via MUI props + theme, not custom CSS.**
Add `aria-label`s to icon buttons, add a focus-visible outline in the theme
(component overrides), and add a skip link in the root layout targeting the
`<main>` landmark.

**D5. Deduplicate JSON keys.**
Remove the shadowed duplicate keys in `en.json` and confirm the surviving
values are the ones rendered (verify against usages before deleting).

## Risks / Trade-offs

- **Guessing translations** → keep them simple and literal; native speakers can
  refine later; parity test still passes.
- **Removing duplicate keys may change rendered text** → check `t('...')`
  usages before deleting the shadowed copy.
- **Skip link can interfere with layout** → make it visually-hidden until
  focused.
- **Focus outline overrides may clash with MUI** → scope to `:focus-visible`.

## Migration Plan

1. Fill missing `account.*` keys in es/fr/de.
2. Add locale-parity test.
3. Source the language picker from config (add German).
4. Replace hardcoded strings with keys across the listed files.
5. Deduplicate `en.json`.
6. A11y: labels, focus-visible, skip link.
7. `yarn verify`.

Rollback: revert the change; purely additive/refactor, no data impact.

## Open Questions

- Any locale should be dropped instead of completed? (Default: complete all
  five.)
