## Context

`Recipe.parentRecipeId` and the self-relation exist in
`apps/api/prisma/schema.prisma`, and `createRecipeInputSchema` /
`updateRecipeInputSchema` already accept `parentRecipeId`
(`libs/shared/src/index.ts`). The API persists it (`apps/api/src/routes/recipes.ts:151,164,205,215`)
and `formatRecipe` already fetches children to populate `nestedRecipeIds`
(`recipes.ts:34-36,59`) — but only ids, and the web layer never sets or shows
nesting. So this is a _wiring + small contract extension_ change, not a data
model change.

## Goals / Non-Goals

**Goals:**

- Let authors create/edit a recipe as a variation of a parent.
- Show parent and variations on the detail page without extra lookups.
- Validate parent references server-side.

**Non-Goals:**

- No schema/migration change (`parentRecipeId` already exists).
- No multi-level tree UI or full ancestry browsing (parent + direct children
  only).
- No automatic merging/inheritance of ingredients between parent and child.
- No deep cycle detection beyond rejecting self-parent (note as a follow-up).

## Decisions

**D1. Extend the response with nesting summaries.**
Add `parentRecipe?: { id, name }` and `nestedRecipes: { id, name }[]` to the
`recipeSchema` and to `formatRecipe`. `formatRecipe` already queries children;
add `name`, and fetch the parent by id when `parentRecipeId` is set. Alternative:
client fetches each related recipe by id — rejected (N extra requests, and the
list endpoint would fan out).

**D2. Parent picker = MUI Autocomplete over visible recipes.**
In `RecipeForm`, add an optional "Based on" `Autocomplete` fed by
`useRecipesQuery` (recipes the user can see), excluding the recipe being edited.
Alternative: plain `Select` — rejected; recipes can be numerous, searchable
input is friendlier for older users (autocomplete also gives good a11y).

**D3. Payload types carry `parentRecipeId`.**
Add `parentRecipeId?: string` to `RecipeForm`'s `TpRecipeFormData` and
`_hooks/recipes.ts`'s `RecipeFormData`, and pass it through create/update. The
API already destructures it.

**D4. Validate references in the API.**
On create/update, if `parentRecipeId` is provided, verify the parent exists
(404→400 `validation_error`) and, on update, reject `parentRecipeId === id`.
Keeps failures as 400s instead of FK 500s / self-cycles.

**D5. Detail rendering, minimal.**
Add a parent chip/link and a "Variations" list using the summaries from D1.
Reuse existing typography/tokens; no new navigation.

## Risks / Trade-offs

- **List-endpoint N+1** (parent + children per recipe) → scales fine for a
  family app; note as a future optimization (could restrict summaries to the
  detail endpoint).
- **Cycle via multi-level nesting** → MVP only blocks self-parent; deeper cycles
  are possible but harmless for rendering; note as follow-up.
- **Autocomplete over all visible recipes could be large** → it is client-side
  filtered and the dataset is small; revisit if it grows.
- **New validation may reject previously-accepted bad ids** → desired behavior;
  no known consumers rely on it.

## Migration Plan

1. Extend `shared` `recipeSchema` + tests.
2. Extend `formatRecipe` (parent + children summaries) and add validation.
3. Add `parentRecipeId` to web payload types + hooks.
4. Add the "Based on" picker to `RecipeForm`.
5. Render parent + variations on the detail page.
6. Add i18n keys to all five locales.
7. `yarn verify:full`.

Rollback: revert code; no schema change to reverse.

## Open Questions

- Should the picker offer _all_ visible recipes or only the author's own? Default:
  all visible (a variation can be based on a shared family recipe).
