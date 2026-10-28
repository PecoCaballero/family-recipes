# Recipe Text Import

## Why

Adding a recipe today means typing every field by hand — name, ingredients,
instructions, metadata. Recipes already exist in plenty of places (websites,
group chats, emails, paper) as plain text, but there is no way to get that text
into the app without retyping it. This change adds an AI-assisted paste-text
import: a user pastes a recipe as raw text, the app extracts a structured draft
server-side, pre-fills the existing create-recipe form, and the user reviews and
submits it. Nothing is auto-saved — the human stays in control of what actually
gets created.

## What Changes

- Add a new API endpoint `POST /v1/recipes/import` that accepts raw text and
  returns a structured draft (`name`, `description`, `ingredients`,
  `instructions`, and any extractable `cuisine`/`prepTime`/`cookTime`/`servings`/
  `difficulty`) shaped to pre-fill `createRecipeInputSchema`. The AI call runs
  server-side (provider key never reaches the client).
- Drive the extraction with OpenAI (chat-completions) configured via environment
  variables (`AI_API_KEY`, `AI_API_BASE_URL`, `AI_API_MODEL`), defaulting to
  `https://api.openai.com/v1` and `gpt-4o-mini`.
- Fail deterministically: missing config, provider errors, and unparseable
  output all return explicit errors — never a silent guess.
- Add shared Zod schemas for the import request/response so web and api agree on
  the contract.
- Add an "Import" entry point on the recipes page that opens a paste-text scene,
  calls the import endpoint, shows a parsed preview, then pre-fills the existing
  `RecipeForm` (reused, not duplicated) so the user edits and submits as normal.
- Add all new UI strings to the five locales.

## Capabilities

### New Capabilities

- `recipe-text-import`: Paste a plain-text recipe, have the API extract a
  structured draft via AI, preview it, and pre-fill the create-recipe form for
  review and manual submit.

### Modified Capabilities

- `recipe-crud`: The recipes API gains a non-persisting `POST /recipes/import`
  endpoint and the shared library gains import request/response schemas. No
  existing recipe schema or create/update contract is changed.

## Impact

- **Apps**: `web`, `api`, `shared`.
- **Code**: `libs/shared/src/index.ts` (new `recipeImportRequestSchema`,
  `recipeImportDraftSchema`, `recipeImportResponseSchema`),
  `apps/api/src/routes/recipes.ts` (new `POST /import` route) plus a new
  AI-client module (`apps/api/src/lib/recipeImport.ts`),
  `apps/web/src/app/_hooks/recipes.ts` (new `useImportRecipe` mutation),
  `apps/web/src/app/_scenes/RecipeForm.tsx` + `RecipeFormScene.tsx` (optional
  `initialData` pre-fill + inline import step), and
  `apps/web/src/app/(root)/recipes/page.tsx` (Import entry point).
- **Config/env**: new `AI_API_KEY` (required), `AI_API_BASE_URL` and
  `AI_API_MODEL` (optional); document in `.env.example`.
- **No schema/migration change** — import never persists; it only returns a
  draft for the existing create flow.
- **Verification**: `yarn verify`; `yarn verify:full` if API behavior warrants
  e2e coverage.
