## Context

The recipe detail page renders `RecipeMenu` (⋮ menu). Its items: favorite (save/unsave), edit (wired), delete (no handler), send-to-group (wired via `SendRecipeDrawer`), share (no handler). The backend recipes router already implements save/unsave/delete. Existing hooks in `_hooks/recipes.ts`: `useRecipesQuery`, `useRecipeQuery`, `useCreateRecipe`, `useUpdateRecipe`, `useDeleteRecipe`. `useDeleteRecipe` exists but is unused; `RecipeFormScene.handleDelete` is dead code.

## Goals / Non-Goals

**Goals:**
- Make save/unsave, delete, and share functional from the recipe detail menu.
- Keep the backend unchanged (endpoints already exist).
- Follow the existing React Query + MUI patterns.

**Non-Goals:**
- Optimistic UI updates.
- New backend endpoints or shared schema changes.
- Deep-link / public share URL generation (share uses the current page URL).
- A global toast/snackbar system.

## Decisions

### Decision 1: Save/unsave via new hooks + cache invalidation

**Chosen**: Add `useSaveRecipe(id)` and `useUnsaveRecipe(id)` hooks that POST to `/v1/recipes/:id/save` and `/v1/recipes/:id/unsave`, invalidating `['recipes', id]` and `['recipes']` on success. The menu item's `onClick` calls the appropriate mutation based on `recipe.isSaved` and closes the menu.

**Rationale**: Mirrors the existing `useCreateRecipe`/`useUpdateRecipe` hook + invalidation pattern. Both endpoints are already idempotent.

**Alternatives considered**:
- *Optimistic update via `setQueryData`*: snappier but more complex and inconsistent with the rest of the codebase. Rejected for MVP.

### Decision 2: Delete via confirmation dialog lifted to the recipe page

**Chosen**: `RecipeMenu` accepts an optional `onDelete` callback; the recipe detail page owns a `ConfirmDialog` + `useDeleteRecipe`. On confirm, mutate then `router.push('/recipes')`. Remove the dead `handleDelete`/`deleteMutation` from `RecipeFormScene`.

**Rationale**: Reuses the existing `ConfirmDialog` component (already used in group settings). Keeps `RecipeMenu` presentational.

**Alternatives considered**:
- *Dialog inside `RecipeMenu`*: couples the menu component to the mutation and its own dialog state; rejected.

### Decision 3: Share via Web Share API with clipboard fallback

**Chosen**: The share item's `onClick` feature-detects `navigator.share` and calls `navigator.share({ title, text, url })` using the recipe name and `window.location.href`. When unavailable, fall back to `navigator.clipboard.writeText(url)`.

**Rationale**: Zero backend cost, native mobile UX, graceful desktop fallback.

**Alternatives considered**:
- *Share into a group*: overlaps with the existing "Send to group" item. Rejected.
- *Clipboard-only*: loses native share sheet on mobile. Rejected.

### Decision 4: Minimal i18n additions

**Chosen**: Add only the keys needed for the share fallback feedback (e.g. `recipes.shareFallbackCopied`), reusing existing `saveRecipe`, `unsaveRecipe`, `deleteRecipe`, and `share` keys.

## Risks / Trade-offs

- **`navigator.share` availability** → Desktop browsers (Safari/Firefox) may not expose it; the clipboard fallback covers this.
- **Clipboard requires secure context** → The app runs on HTTPS/localhost, so this is acceptable.
- **No toast system exists** → Share feedback is minimal; a simple `window.alert` or an in-place label is sufficient for now.
