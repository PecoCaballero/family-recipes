## 1. Shared contract

- [ ] 1.1 Add `recipeImportRequestSchema`, `recipeImportDraftSchema`, `recipeImportResponseSchema` to `libs/shared/src/index.ts` (shared)
- [ ] 1.2 Add unit tests for the import schemas (shared)

## 2. API

- [ ] 2.1 Add `AI_API_KEY` (required), `AI_API_BASE_URL`, `AI_API_MODEL` (optional) to `.env.example` with defaults and usage notes (api)
- [ ] 2.2 Add `apps/api/src/lib/recipeImport.ts`: build chat-completions request via global `fetch`, prompt for JSON output, parse + validate against `recipeImportDraftSchema`, default empty `description` to `name` (api)
- [ ] 2.3 Add `POST /recipes/import` route: validate `text`, call the importer, map failures to `ai_not_configured` / `ai_upstream_error` / `import_unparseable` (api)
- [ ] 2.4 Add unit tests for the importer (schema validation, empty-description default, provider error mapping) (api)

## 3. Web hooks & form

- [ ] 3.1 Add `useImportRecipe` mutation to `apps/web/src/app/_hooks/recipes.ts` (web)
- [ ] 3.2 Add optional `initialData` pre-fill prop to `RecipeForm` and forward it from `RecipeFormScene` (web)

## 4. Web import scene & entry point

- [ ] 4.1 Add `recipes.import` route to `apps/web/src/app/_utils/routes.ts` and a new `/recipes/import` page (web)
- [ ] 4.2 Add `RecipeImportScene`: textarea, parse action, loading/error states, parsed preview, "Use this recipe" (web)
- [ ] 4.3 Add the Import entry point (secondary FAB/button) to `(root)/recipes/page.tsx` (web)
- [ ] 4.4 Hand the draft to the create scene (sessionStorage transport, cleared on submit) (web)

## 5. i18n

- [ ] 5.1 Add new `recipes.import*` keys to all five locales: en, es, fr, de, pt (e.g. importRecipe, importPastePrompt, importParse, importParsing, importPreview, importUseRecipe, importError, importUnparseable, importNotConfigured) (web)

## 6. Tests

- [ ] 6.1 Add tests for the import scene (paste → parse → preview → pre-fill) and error rendering (web)

## 7. Verify

- [ ] 7.1 Run `yarn verify` (and `yarn verify:full` for the API behavior)
