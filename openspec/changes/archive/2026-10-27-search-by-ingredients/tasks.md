## 1. Shared contract

- [x] 1.1 Add `pantryItemSchema`, `addPantryItemInputSchema`, `pantrySuggestionSchema`, and `pantrySuggestResponseSchema` to `libs/shared/src/index.ts` (shared)
- [x] 1.2 Add unit tests for the new schemas (shared)

## 2. Database

- [x] 2.1 Add `PantryItem` model and `User.pantryItems` relation (`onDelete: Cascade`, `@@unique([userId, name])`) to `schema.prisma` (api)
- [x] 2.2 Generate and review the migration (`npx prisma migrate dev`) (api)

## 3. API

- [x] 3.1 Create `apps/api/src/routes/pantry.ts` with `GET /pantry` (list) and `POST /pantry` (add, normalized-unique check returning 409 on duplicate) (api)
- [x] 3.2 Add `DELETE /pantry/:id` (remove own item, 404 otherwise) (api)
- [x] 3.3 Add `GET /pantry/suggest` (visibility filter + coverage scoring + sort + cap) reusing `formatRecipe` (api)
- [x] 3.4 Mount `pantryRouter` at `/pantry` in `apps/api/src/routes/index.ts` (api)

## 4. Web hooks

- [x] 4.1 Create `apps/web/src/app/_hooks/pantry.ts` with `usePantryQuery`, `useAddPantryItem`, `useRemovePantryItem`, and `usePantrySuggestionsQuery` (web)

## 5. Web UI

- [x] 5.1 Add a pantry mode/section to `apps/web/src/app/(root)/search/page.tsx` (ingredient list with add/remove, plus suggestions grouped "can make" / "almost") (web)

## 6. i18n

- [x] 6.1 Add a `pantry` namespace to all five locales (`en`, `es`, `fr`, `de`, `pt`): `title`, `addPlaceholder`, `add`, `remove`, `empty`, `findRecipes`, `youCanMake`, `almostThere`, `missing_one`/`missing_other`, `noSuggestions`, `removeConfirm` (web)

## 7. Tests

- [x] 7.1 Add API tests for pantry CRUD (add/list/remove, duplicate 409, 404, auth 401) and suggest scoring/visibility (api)
- [x] 7.2 Add web tests for the pantry mode on the search page (add/remove, suggestion grouping) (web)
- [x] 7.3 Extend api e2e to exercise the pantry flow against the migration-built DB (api)

## 8. Verify

- [x] 8.1 Run `yarn verify:full` (api, web, shared)
