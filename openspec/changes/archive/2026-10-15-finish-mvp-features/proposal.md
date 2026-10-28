# Finish MVP Features

## Why

Several capabilities are half-wired: the API exposes invitation creation
(`useCreateInvitation`) and remove-recipe-from-group (`useRemoveRecipeFromGroup`)
but no UI calls them; recipe metadata keys exist in i18n (`cuisine`, `prepTime`,
`cookTime`, `servings`, `difficulty`) but the model, schema, form, and detail
have no such fields; there is no app-wide toast (errors fall back to
`window.alert`); and the privacy/notification settings toggles persist values
that nothing consumes. A launch-ready MVP must present only working features.

## What Changes

- Expose invitation creation in the group settings UI.
- Expose "remove recipe from group" in the group recipe view.
- Add recipe metadata: `cuisine`, `prepTime` (minutes), `cookTime` (minutes),
  `servings`, `difficulty` across `shared` Zod schemas, Prisma model +
  migration, API create/update/read, and the web recipe form + detail view.
- Add a global toast/snackbar provider and replace `window.alert` usages.
- Resolve non-functional settings: wire notifications to the toast preference
  where meaningful, and hide any setting that cannot have an effect.

## Capabilities

### New Capabilities

- `recipe-metadata`: Optional structured recipe fields (cuisine, prep time, cook
  time, servings, difficulty) across shared schemas, API, and web UI.
- `feature-completion`: In-app invitation UI, remove-from-group UI, global toast
  notifications, and resolution of non-functional settings.

### Modified Capabilities

<!-- recipe-crud's create/retrieve requirements remain satisfied; metadata is
additive (optional fields), so no MODIFIED delta is required. -->

## Impact

- **Apps**: `api`, `web`, `shared`.
- **Code**: `libs/shared/src/index.ts` (schemas), `apps/api/prisma/schema.prisma`
  (+ new migration), `apps/api/src/routes/recipes.ts`, `apps/api/src/routes/groups.ts`,
  `apps/web/src/app/_hooks/groups.ts`, `_scenes/RecipeForm.tsx`,
  `(root)/recipes/[id]/page.tsx`, `(root)/groups/[id]/page.tsx`,
  `(root)/groups/[id]/settings/page.tsx`, new toast provider, `_components/RecipeMenu.tsx`.
- **Migration**: yes — Prisma migration for the new recipe columns (nullable).
- **Verification**: `yarn verify:full` (migration + e2e).
