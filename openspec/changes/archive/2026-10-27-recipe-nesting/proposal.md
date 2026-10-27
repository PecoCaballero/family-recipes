# Recipe Nesting

## Why

Recipes were designed to support nesting — a recipe can be a variation of a
parent recipe (`parentRecipeId`, `nestedRecipeIds`) — and the API already
persists and returns these relationships. But the web app never exposes them:
`RecipeForm` cannot pick a parent (and the web payload types omit
`parentRecipeId`), and the recipe detail page never shows a recipe's parent or
its variations. For a family app this matters most for "grandma's version vs.
mine" style variations. This change makes nesting usable end-to-end.

## What Changes

- Add an optional, searchable **"Based on"** parent-recipe picker to
  `RecipeForm` (create and edit), defaulting to none.
- Include `parentRecipeId` in the web form payload types and create/update
  hooks so the API receives it.
- Render nesting on the recipe detail page: a link to the **parent** recipe
  (when present) and a **"Variations"** section listing child recipes.
- Extend the recipe API response with the parent's and children's `{ id, name }`
  so the detail page can render names without extra lookups, and mirror that in
  the shared `recipeSchema`.
- Prevent trivial cycles (a recipe cannot select itself as parent); validate
  that a chosen parent exists.

## Capabilities

### New Capabilities

- `recipe-nesting`: Optional parent/child relationships between recipes —
  choosing a parent at create/edit time and viewing parent and variations on the
  detail page.

### Modified Capabilities

- `recipe-crud`: create/update accept `parentRecipeId` from the web client and
  the recipe response includes parent/children summaries (`parentRecipe`,
  `nestedRecipes`). Existing requirements remain satisfied; this adds the
  contract the web UI depends on.

## Impact

- **Apps**: `web`, `api`, `shared`.
- **Code**: `libs/shared/src/index.ts` (`recipeSchema` gains
  `parentRecipe`/`nestedRecipes`; input schemas already have `parentRecipeId`),
  `apps/api/src/routes/recipes.ts` (`formatRecipe` returns parent/children;
  validate parent on create/update), `apps/web/src/app/_scenes/RecipeForm.tsx`,
  `_scenes/RecipeFormScene.tsx`, `_hooks/recipes.ts` (payload type),
  `(root)/recipes/[id]/page.tsx`.
- **No schema/migration change** — `parentRecipeId` already exists.
- **Verification**: `yarn verify:full` (API behavior changed).
