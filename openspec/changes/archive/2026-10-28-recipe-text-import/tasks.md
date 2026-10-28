## 1. Shared contract

- [x] 1.1 Add `recipeImportRequestSchema`, `recipeImportDraftSchema`, `recipeImportResponseSchema` to `libs/shared/src/index.ts` (shared)
- [x] 1.2 Add unit tests for the import schemas (shared)

## 2. API

- [x] 2.1 Add `AI_API_KEY` (required), `AI_API_BASE_URL`, `AI_API_MODEL` (optional) to `.env.example` with defaults and usage notes (api)
- [x] 2.2 Add `apps/api/src/lib/recipeImport.ts`: OpenAI chat-completions via global `fetch` with `AbortSignal.timeout(15000)`, `response_format: json_object`, normalize output (coerce numbers, strip units from times, lowercase difficulty, string ingredients → objects), validate against `recipeImportDraftSchema`, default empty `description` to `name` (api)
- [x] 2.3 Add `POST /recipes/import` route: validate `text`, call the importer, map failures to `ai_not_configured` / `ai_upstream_error` / `import_unparseable` (api)
- [x] 2.4 Add unit tests for the importer (schema validation, empty-description default, provider error mapping) (api)

## 3. Web hooks & form

- [x] 3.1 Add `useImportRecipe` mutation to `apps/web/src/app/_hooks/recipes.ts` (web)
- [x] 3.2 Add optional `initialData` pre-fill prop to `RecipeForm` and forward it from `RecipeFormScene` (web)

## 4. Web import step & entry point

- [x] 4.1 Add the import step (textarea, parse action, loading/error states, parsed preview, "Use this recipe") inside the `/recipes/create` scene (web)
- [x] 4.2 Add the Import entry point (secondary FAB/button) to `(root)/recipes/page.tsx`, navigating to `/recipes/create?import=1` (web)
- [x] 4.3 Hand the draft to the form via local state (`initialData`) — no sessionStorage (web)

## 5. i18n

- [x] 5.1 Add new `recipes.import*` keys to all five locales: en, es, fr, de, pt (e.g. importRecipe, importPastePrompt, importParse, importParsing, importPreview, importUseRecipe, importError, importUnparseable, importNotConfigured) (web)

## 6. Tests

- [x] 6.1 Add tests for the import scene (paste → parse → preview → pre-fill) and error rendering (web)

## 7. Verify

- [x] 7.1 Run `yarn verify` (and `yarn verify:full` for the API behavior)
