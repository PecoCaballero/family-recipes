## 1. Shared contract

- [ ] 1.1 Add `pantryItemSchema`, `addPantryItemInputSchema`, `pantrySuggestionSchema`, and `pantrySuggestResponseSchema` to `libs/shared/src/index.ts` (shared)
- [ ] 1.2 Add unit tests for the new schemas (shared)

## 2. Database

- [ ] 2.1 Add `PantryItem` model and `User.pantryItems` relation (`onDelete: Cascade`, `@@unique([userId, name])`) to `schema.prisma` (api)
- [ ] 2.2 Generate and review the migration (`npx prisma migrate dev`) (api)

## 3. API

- [ ] 3.1 Create `apps/api/src/routes/pantry.ts` with `GET /pantry` (list) and `POST /pantry` (add, normalized-unique check returning 409 on duplicate) (api)
- [ ] 3.2 Add `DELETE /pantry/:id` (remove own item, 404 otherwise) (api)
- [ ] 3.3 Add `GET /pantry/suggest` (visibility filter + coverage scoring + sort + cap) reusing `formatRecipe` (api)
- [ ] 3.4 Mount `pantryRouter` at `/pantry` in `apps/api/src/routes/index.ts` (api)

## 4. Web hooks

- [ ] 4.1 Create `apps/web/src/app/_hooks/pantry.ts` with `usePantryQuery`, `useAddPantryItem`, `useRemovePantryItem`, and `usePantrySuggestionsQuery` (web)

## 5. Web UI

- [ ] 5.1 Add a pantry mode/section to `apps/web/src/app/(root)/search/page.tsx` (ingredient list with add/remove, plus suggestions grouped "can make" / "almost") (web)

## 6. i18n

- [ ] 6.1 Add a `pantry` namespace to all five locales (`en`, `es`, `fr`, `de`, `pt`): `title`, `addPlaceholder`, `add`, `remove`, `empty`, `findRecipes`, `youCanMake`, `almostThere`, `missing_one`/`missing_other`, `noSuggestions`, `removeConfirm` (web)

## 7. Tests

- [ ] 7.1 Add API tests for pantry CRUD (add/list/remove, duplicate 409, 404, auth 401) and suggest scoring/visibility (api)
- [ ] 7.2 Add web tests for the pantry mode on the search page (add/remove, suggestion grouping) (web)
- [ ] 7.3 Extend api e2e to exercise the pantry flow against the migration-built DB (api)

## 8. Verify

- [ ] 8.1 Run `yarn verify:full` (api, web, shared)
