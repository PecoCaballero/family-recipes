## Context

`Recipe.ingredients` are free-text (`Ingredient.name`, `unit?`, `quantity`) with
no canonical ingredient taxonomy, so matching must be string-based. The recipe
list handler in `apps/api/src/routes/recipes.ts:88-142` already centralizes the
visibility rules (author, `visibility: 'public'`, or group membership via
`RecipeGroup` → `GroupMember`) and formats recipes via `formatRecipe`
(`recipes.ts:31-86`); the suggest endpoint must reuse both. There is no pantry
concept today, so this is a _new model + new endpoint + new UI_ change, unlike
recipe-nesting which was pure wiring.

Users are identified by `req.userId` (set by `authMiddleware`), and resource
routers (`recipes`, `groups`, `users`) are mounted under `/v1` in
`apps/api/src/routes/index.ts`. The web app uses TanStack Query hooks
(`apps/web/src/app/_hooks/*.ts`) and a four-item `BottomNavigation` (Groups,
Recipes, Search, Account).

## Goals / Non-Goals

**Goals:**

- Persistent per-user pantry list (add / view / remove ingredient names).
- Suggest recipes the user can make from their pantry, sorted best-first.
- Respect existing recipe visibility rules in suggestions.
- Minimal, familiar UI consistent with existing pages; all strings localized.

**Non-Goals:**

- Canonical ingredient taxonomy, fuzzy/ML matching, or units/quantities in the
  pantry (names only).
- Image recognition of ingredients.
- Cross-user pantry sharing.
- A one-off search field — the pantry is persistent and recurring.

## Decisions

**D1. New `PantryItem` model with a composite unique per user.**
Add `PantryItem { id, userId, name, createdAt, updatedAt }` with
`@@unique([userId, name])` and a `User.pantryItems` relation (`onDelete:
Cascade`). Store the name as typed but enforce uniqueness on the normalized
(lowercased, trimmed) value at write time. Alternative: a JSON column on `User`
— rejected; a relation gives referential integrity, cascade delete, and room to
grow (e.g. quantities later).

**D2. Dedicated `pantryRouter` at `/v1/pantry`.**
New `apps/api/src/routes/pantry.ts` mounted in `routes/index.ts`. Endpoints:
`GET /pantry` (list), `POST /pantry` (add), `DELETE /pantry/:id` (remove),
`GET /pantry/suggest` (suggestions). Declare `GET /pantry/suggest` before any
`:id` route to avoid the id matcher swallowing "suggest" (there is no `GET
/pantry/:id`, so no conflict, but order is defensive). Alternative: nest under
`/users/me/pantry` — rejected; the app already favors flat resource routers, and
`req.userId` scoping is the established pattern.

**D3. Case-insensitive substring/equality matching.**
An ingredient is "covered" when, after trimming and lowercasing, a pantry item
name and the ingredient name are equal or one is a substring of the other (so
"tomato" covers "tomatoes"). Deterministic and testable. Alternative: strict
equality — rejected (too brittle); canonical taxonomy/fuzzy — out of scope.

**D4. Coverage buckets and ordering.**
Per recipe, count unmatched ingredients: `0` → status `canMake`; `1..2` →
status `almost` with `missingIngredients`; `>2` → omitted. Sort `canMake` before
`almost`, then by `missingCount` asc, then `lastUpdated` desc. Cap the response
(e.g. 50). Alternative: return every recipe with a score — rejected; unfiltered
results bury the useful "make it now" signal.

**D5. Reuse visibility scope and `formatRecipe` in suggest.**
The suggest endpoint filters to the same visible set as `GET /v1/recipes`
(author / public / group membership) and returns the full formatted recipe
(`formatRecipe`) plus scoring fields, so the client renders suggestions without
extra lookups. Alternative: return recipe ids only — rejected (N+1 on the
client, same reason as recipe-nesting D1).

**D6. Web: integrate the pantry into the Search page.**
The pantry lives on the existing Search page
(`apps/web/src/app/(root)/search/page.tsx`) as a second mode alongside text
search (e.g. a segmented toggle: "Recipes" / "Pantry"). Pantry mode shows the
add/remove ingredient list and, below it, the suggestions grouped "You can make"
/ "Almost there". No new route or bottom-nav item. Alternative: a dedicated
`/pantry` page + fifth nav item — rejected; the pantry is small and the Search
page already owns discovery.

**D7. Shared schemas for the contract.**
Add to `libs/shared/src/index.ts`: `pantryItemSchema` (`{ id, name }`),
`addPantryItemInputSchema` (`{ name: string, min 1, max 100 }`),
`pantrySuggestionSchema` (`{ recipe, status: 'canMake'|'almost',
missingCount, missingIngredients: string[] }`), and
`pantrySuggestResponseSchema` (`{ suggestions }`).

## Risks / Trade-offs

- **Substring matching over/under-matches** ("chicken" vs "chicken broth",
  "tomato" vs "tomato sauce") → heuristic only; document as a follow-up for a
  canonical taxonomy. No ML/fuzzy in scope.
- **Suggest recomputes coverage over all visible recipes each call**
  (O(recipes × ingredients × pantry)) → trivial at family scale; note caching or
  a pantry-ingredient index as a future optimization.
- **Normalized-unique enforcement lives in application code** (not the DB
  collation) → keep a single normalize helper and reuse it on add and in the
  unique check; the DB unique is a backstop, not the UX path.
- **Pantry shares the Search page with text search** → a mode toggle keeps both
  focused; if the pantry grows (quantities, shopping list) promote it to its own
  destination later.
- **New migration must reach e2e** → `nx run api:e2e` builds from
  `prisma migrate deploy` + seed, so a missing/incorrect migration surfaces as a
  red sensor.

## Migration Plan

1. Add `PantryItem` to `schema.prisma`; generate and review a migration
   (`npx prisma migrate dev`).
2. Add shared schemas + unit tests (`shared`).
3. Add `pantry.ts` router (CRUD + suggest) and mount it; API tests.
4. Add `_hooks/pantry.ts` (query + mutations).
5. Add the pantry mode/section to the Search page.
6. Add i18n keys to all five locales.
7. `yarn verify:full`.

Rollback: revert code and delete the migration; drop `PantryItem` (new table, no
existing data to migrate).

## Open Questions

- **Matching rule granularity** — substring containment (default) vs strict
  equality vs word-boundary matching. Default: substring containment, refine
  after real-world pantry data.
- **"Almost there" threshold** — hardcode `missing ≤ 2` (default) vs make it a
  per-user setting. Default: hardcoded for MVP.
- **Pantry navigation slot** — resolved: pantry lives on the Search page (no new
  nav item). Revisit a dedicated destination only if the pantry grows.
- **Normalization at write time** — store the name exactly as typed (default) vs
  normalize to lowercase on save. Default: store as typed, normalize for
  matching and uniqueness.
- **Suggest pagination** — cap at 50 with no paging (default) vs full
  pagination. Default: capped, no paging for MVP.
