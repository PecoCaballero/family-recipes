## Why

The recipe detail menu (⋮) exposes save/unsave, delete, and share actions, but none are wired to handlers. The backend already implements save/unsave (`POST /v1/recipes/:id/save`, `/unsave`) and delete (`DELETE /v1/recipes/:id`), yet the frontend has no hooks or click handlers for them — leaving three dead buttons. Share has no defined behavior at all.

## What Changes

- Wire the save/unsave menu item to the existing save/unsave endpoints via new `useSaveRecipe` / `useUnsaveRecipe` hooks; toggle label/icon based on `recipe.isSaved`.
- Wire the delete menu item (author-only) to the existing `DELETE /v1/recipes/:id` endpoint, behind a confirmation dialog, redirecting to `/recipes` on success.
- Implement share via the Web Share API (`navigator.share`), falling back to clipboard copy when unavailable.
- Remove dead code: `handleDelete`/`deleteMutation` in `RecipeFormScene` and the simulated-save `TODO` branch in `RecipeForm`.

## Capabilities

### New Capabilities

- `recipe-actions`: Recipe detail menu actions — save/unsave toggle, delete with confirmation, and share.

### Modified Capabilities

None. Backend save/unsave/delete behavior is already specified in `recipe-crud`.

## Impact

- **Frontend** (`apps/web`): `_hooks/recipes.ts`, `RecipeMenu.tsx`, `recipes/[id]/page.tsx`, `RecipeFormScene.tsx`, `RecipeForm.tsx`, and i18n locale files.
- No backend, shared, or database changes — the required endpoints already exist.
