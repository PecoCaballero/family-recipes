# Search by Ingredients

## Why

A user standing in their kitchen knows what ingredients they have at home, but
not what they can cook with them. The app's search only matches recipe names,
descriptions, and ingredient names against a typed text query — it cannot answer
"what can I make with what I have." This change adds a persistent per-user
"pantry" and ingredient-based suggestions so a user can record what's on hand
once and get recipe suggestions every time they open the app.

## What Changes

- Add a persistent per-user **pantry**: a list of ingredient names the user keeps
  at home, backed by a new `PantryItem` Prisma model (`userId` + `name`, unique
  per user) and a migration.
- Add a pantry API at `/v1/pantry`: list, add, and remove pantry items, plus
  `GET /v1/pantry/suggest` which scores recipes visible to the user against their
  pantry.
- Suggest recipes by matching pantry item names against
  `Recipe.ingredients[].name` (case-insensitive string match). Recipes whose
  ingredients are fully covered are "you can make"; recipes missing ≤ 2
  ingredients are "almost there" (with the missing names); the rest are omitted.
  Results are sorted best-first.
- Add shared Zod schemas for pantry items and suggestion responses
  (`@family-recipe/shared`).
- Integrate the pantry into the existing **Search page** (no new nav tab): a
  pantry mode/section where the user manages their ingredient list and sees
  suggested recipes, grouped into "You can make" and "Almost there".
- Add all new UI strings to all five locales (`en`, `es`, `fr`, `de`, `pt`).

## Capabilities

### New Capabilities

- `search-by-ingredients`: A persistent per-user pantry ingredient list with
  add/remove management, and recipe suggestions scored against the pantry
  ("can make" / "almost there").

### Modified Capabilities

<!-- none -->

## Impact

- **Apps**: `web`, `api`, `shared`.
- **Code**:
  - `apps/api/prisma/schema.prisma` (new `PantryItem` model + `User.pantryItems`
    relation) **+ migration**.
  - `apps/api/src/routes/pantry.ts` (new router: list/add/remove + suggest),
    `apps/api/src/routes/index.ts` (mount `/pantry`).
  - `libs/shared/src/index.ts` (`pantryItemSchema`, `addPantryItemInputSchema`,
    `pantrySuggestionSchema`, `pantrySuggestResponseSchema`).
  - `apps/web/src/app/_hooks/pantry.ts` (new hooks),
    `apps/web/src/app/(root)/search/page.tsx` (add pantry mode/section),
    `apps/web/src/app/_i18n/locales/*.json` (5 locales).
- **Schema/migration change**: yes — new `PantryItem` table; e2e builds the DB
  purely from `prisma migrate deploy`, so a migration is required.
- **Verification**: `yarn verify:full` (new model, migration, and API behavior).
