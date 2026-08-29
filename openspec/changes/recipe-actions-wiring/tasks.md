## 1. Hooks — save/unsave (web)

- [ ] 1.1 Add `useSaveRecipe(id)` to `apps/web/src/app/_hooks/recipes.ts`: POST `/v1/recipes/:id/save`, invalidate `['recipes', id]` and `['recipes']` on success
- [ ] 1.2 Add `useUnsaveRecipe(id)` to `apps/web/src/app/_hooks/recipes.ts`: POST `/v1/recipes/:id/unsave`, invalidate `['recipes', id]` and `['recipes']` on success

## 2. Recipe menu wiring (web)

- [ ] 2.1 Wire the favorite menu item `onClick` to call save/unsave based on `recipe.isSaved`, closing the menu
- [ ] 2.2 Add an `onDelete` prop to `RecipeMenu.tsx` and invoke it from the delete menu item (author-only)
- [ ] 2.3 Implement the share menu item `onClick` using `navigator.share` with a `navigator.clipboard` fallback
- [ ] 2.4 Add the share fallback i18n key(s) to all five locale files

## 3. Recipe detail page — delete confirmation (web)

- [ ] 3.1 Add a `ConfirmDialog` and `useDeleteRecipe` to `apps/web/src/app/(root)/recipes/[id]/page.tsx`
- [ ] 3.2 On confirm, delete the recipe and redirect to `/recipes`

## 4. Cleanup dead code (web)

- [ ] 4.1 Remove the unused `handleDelete`/`deleteMutation` from `RecipeFormScene.tsx`
- [ ] 4.2 Remove the simulated-save `TODO` branch from `RecipeForm.tsx`

## 5. Verification

- [ ] 5.1 Run lint and typecheck for the affected app
- [ ] 5.2 Manually verify save, unsave, delete (confirm + cancel), and share on the recipe detail page
