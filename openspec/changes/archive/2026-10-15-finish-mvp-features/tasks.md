## 1. Recipe metadata (shared)

- [x] 1.1 Add optional `cuisine`, `prepTime`, `cookTime`, `servings`, `difficulty` to `recipeSchema`, `createRecipeInputSchema`, `updateRecipeInputSchema` with validation (shared)
- [x] 1.2 Add unit tests for metadata validation (shared)

## 2. Recipe metadata (api)

- [x] 2.1 Add nullable metadata columns to the Prisma `Recipe` model (api)
- [x] 2.2 Generate and apply a new migration (api)
- [x] 2.3 Persist and return metadata in recipe create/update/read routes (api)

## 3. Recipe metadata (web)

- [x] 3.1 Add optional metadata fields to `RecipeForm` (collapsible) (web)
- [x] 3.2 Display metadata in the recipe detail view (web)

## 4. Toast system

- [x] 4.1 Add a `ToastProvider` (context + MUI Snackbar/Alert) mounted in the root layout (web)
- [x] 4.2 Replace `window.alert` usages with toasts (`RecipeMenu` etc.) (web)

## 5. Surface built actions

- [x] 5.1 Add invitation creation UI to group settings using `useCreateInvitation` (web)
- [x] 5.2 Add remove-recipe-from-group UI with confirmation using `useRemoveRecipeFromGroup` (web)

## 6. Settings resolution

- [x] 6.1 Wire the notifications setting to suppress non-error toasts (web)
- [x] 6.2 Hide settings that have no implemented effect (web)

## 7. Verify

- [x] 7.1 Run `yarn verify:full` (migration + e2e) (api, web, shared)
