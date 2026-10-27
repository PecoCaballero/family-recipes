## 1. Shared contract

- [x] 1.1 Add `parentRecipe?: { id, name }` and `nestedRecipes: { id, name }[]` to `recipeSchema` (shared)
- [x] 1.2 Add unit tests for the extended schema (shared)

## 2. API

- [x] 2.1 Extend `formatRecipe` to return `parentRecipe` and `nestedRecipes` summaries (api)
- [x] 2.2 Validate `parentRecipeId` on create/update (exists; not self) returning 400 on failure (api)

## 3. Web form

- [x] 3.1 Add `parentRecipeId` to `TpRecipeFormData` and `RecipeFormData` payload types and pass through hooks (web)
- [x] 3.2 Add an optional "Based on" Autocomplete to `RecipeForm`, excluding the recipe being edited (web)

## 4. Web detail

- [x] 4.1 Show a link to the parent recipe when present (web)
- [x] 4.2 Show a "Variations" section listing child recipes (web)

## 5. i18n

- [x] 5.1 Add new keys ("Based on", "Variations", "No parent", etc.) to all five locales (web)

## 6. Tests

- [x] 6.1 Add tests for the nesting picker payload and detail rendering of parent/variations (web)

## 7. Verify

- [x] 7.1 Run `yarn verify:full` (api, web, shared)
