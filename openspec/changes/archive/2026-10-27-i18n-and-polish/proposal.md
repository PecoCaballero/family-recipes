# i18n and Polish

## Why

The app advertises five locales but drifts: es/fr/de are each missing 22
`account.*` keys, German is not selectable in the language picker
(`AccountScene.tsx` lists only en/es/fr/pt), several strings are hardcoded
English (auth errors, recipe-form placeholders and helper text, 404, error
fallbacks), and `en.json` has duplicate keys. Accessibility also has gaps:
several `IconButton`s lack `aria-label`, there is no focus-visible styling or
skip link, and no locale-parity guard exists. These undermine the MVP's
"no rough edges" bar.

## What Changes

- Fill the 22 missing `account.*` keys in `es`, `fr`, and `de`; ensure all five
  locales have identical key sets.
- Make German selectable in the language picker.
- Internationalize hardcoded English strings across auth, recipe form,
  ingredients list, 404, and error screens.
- De-duplicate keys in `en.json`.
- Add a locale-parity unit test that fails when key sets diverge.
- Accessibility pass: add missing `aria-label`s, focus-visible styling,
  a skip-to-content link, and correct landing-page semantics.

## Capabilities

### New Capabilities

- `localization`: Complete, parity-checked translations across all five locales
  and internationalized UI strings.
- `accessibility`: Labeled interactive controls, visible focus, and keyboard
  navigability for the web app.

### Modified Capabilities

<!-- None; no existing spec covers i18n or a11y behavior. -->

## Impact

- **App**: `web` only.
- **Code**: `apps/web/src/app/_i18n/locales/*.json`, `_i18n/config.ts`,
  `_scenes/LoginScene.tsx`, `_scenes/RegisterScene.tsx`, `_scenes/RecipeForm.tsx`,
  `_scenes/IngredientsList.tsx`, `_scenes/AccountScene.tsx`, `not-found.tsx`,
  `_components/GenericErrorScreen.tsx`, `_components/BottomNavigation.tsx`,
  `(root)/recipes/[id]/page.tsx`, `_components/AvatarUpload.tsx`, root layout.
- **Verification**: `yarn verify` (web), including the new parity test.
