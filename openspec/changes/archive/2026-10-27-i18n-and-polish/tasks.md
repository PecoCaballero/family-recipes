## 1. Locale parity

- [x] 1.1 Add the 22 missing `account.*` keys to `es.json`, `fr.json`, `de.json` (web)
- [x] 1.2 Deduplicate shadowed keys in `en.json` after checking usages (web)
- [x] 1.3 Add a locale-parity Jest spec asserting identical key sets across all five locales (web)

## 2. Language picker

- [x] 2.1 Source the language picker from `_i18n/config.ts` so German is selectable (web)

## 3. Internationalize strings

- [x] 3.1 Replace hardcoded strings in `LoginScene` and `RegisterScene` with keys in all locales (web)
- [x] 3.2 Replace hardcoded placeholders/helper text in `RecipeForm` and `IngredientsList` (web)
- [x] 3.3 Internationalize `not-found.tsx` and `GenericErrorScreen` fallbacks (web)

## 4. Accessibility

- [x] 4.1 Add `aria-label`s to unlabeled icon buttons (recipe overflow, ingredient edit/delete, avatar upload) (web)
- [x] 4.2 Add focus-visible styling via theme component overrides (web)
- [x] 4.3 Add a skip-to-content link targeting the main landmark in the root layout (web)

## 5. Verify

- [x] 5.1 Run `yarn verify` and confirm all locales render (web)
