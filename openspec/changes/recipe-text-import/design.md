## Context

Creating a recipe requires manually filling `name`, `description`, `ingredients`
and `instructions` (plus optional metadata) in `RecipeForm`
(`apps/web/src/app/_scenes/RecipeForm.tsx`), submitted through
`useCreateRecipe` to `POST /v1/recipes` (`apps/api/src/routes/recipes.ts:163`).
Recipes frequently already exist as plain text (a website, a forwarded message,
a scanned/typed paper card). This change lets a user paste that text, have the
API run an AI extraction server-side, and pre-fill the existing create form —
reusing it verbatim — so the user reviews and submits. The API has no HTTP/AI
client today; Node 22 provides a global `fetch`, so no new provider dependency is
required. The recipe contract already lives in `libs/shared/src/index.ts`
(`ingredientSchema`, `recipeMetadataSchema`, `createRecipeInputSchema`).

## Goals / Non-Goals

**Goals:**

- Paste raw recipe text and get back a structured draft that pre-fills the
  existing create form.
- Keep the provider key server-side; no key or CORS exposure to the client.
- Deterministic, explicit failures — never silently invent a recipe.
- Reuse the existing `RecipeForm`/create flow without duplicating it.

**Non-Goals:**

- No image/photo import or OCR (defer as a follow-up).
- No auto-save: the user must review and submit before anything persists.
- No multi-provider abstraction in MVP — the provider is reached via a single
  env-configured endpoint; the specific provider is decided at implementation
  time (see Open Questions), not locked here.
- No persistence of raw pasted text or drafts.

## Decisions

**D1. Server-side extraction via a new `POST /recipes/import`.**
The endpoint accepts `{ text }`, calls the provider, and returns `{ draft }`
where `draft` is `name`, `description`, `ingredients`, `instructions` and
optional metadata — directly compatible with `createRecipeInputSchema` (minus
`image`/`parentRecipeId`, which AI cannot reliably extract). Registered in
`recipeRouter`; it is a POST with no `:id` segment, so it cannot collide with
`GET /:id` or the `POST /:id/*` action routes. Alternative: call AI from the
browser — rejected (leaks the key, adds CORS, and makes the prompt trivially
inspectable).

**D2. Provider is abstracted behind env-configured endpoint; choice TBD.**
`apps/api/src/lib/recipeImport.ts` builds the provider request using global
`fetch`, configured by `AI_API_KEY` (required) and `AI_API_BASE_URL` /
`AI_API_MODEL` (optional). The concrete provider (OpenAI, Anthropic, local, …)
and its wire format are an open decision — we explore options at implementation
time and keep the call isolated in `recipeImport.ts` so a swap is contained. The
prompt instructs the model to return a JSON object matching the draft shape, and
the response is schema-validated (D3). Alternative: a provider SDK — deferred;
global `fetch` avoids a dependency until the provider is chosen.

**D3. Validate the AI output server-side; fail explicitly.**
The response is parsed and validated against `recipeImportDraftSchema`. A
missing `AI_API_KEY` returns `503 ai_not_configured`; a provider/network failure
returns `502 ai_upstream_error`; output that fails parsing or schema validation
(including an empty or non-recipe result) returns `422 import_unparseable`.
The importer never fabricates a recipe, so an unparseable input is an error the
user can act on (edit/retry), not a guessed result.

**D4. Empty `description` is defaulted so drafts stay submit-valid.**
`createRecipeInputSchema` requires a non-empty `description`; pasted text may
carry none. The import service SHALL default an empty/missing extracted
description to the extracted `name`, keeping the pre-filled form submittable.
Ingredients/instructions that are empty cause the draft to be rejected as
unparseable (they are the essence of a recipe).

**D5. Reuse `RecipeForm` via an optional `initialData` pre-fill.**
`RecipeForm` gains an optional `initialData` prop (a partial draft) used to seed
`formData` on create. `RecipeFormScene` accepts and forwards the draft. The new
`RecipeImportScene` (`/recipes/import`) holds a textarea → "Parse" (calls
`useImportRecipe`) → parsed preview → "Use this recipe", which hands the draft
to the create scene. Transport of the draft between the two routes is via
`sessionStorage` (draft cleared on submit); see Open Questions.

**D6. Entry point on the recipes page.**
A secondary action (an "Import" FAB/icon button) on
`apps/web/src/app/(root)/recipes/page.tsx` alongside the existing create FAB,
navigating to `/recipes/import` (new `recipes.import` route in
`apps/web/src/app/_utils/routes.ts`). Keeps create unchanged; import is opt-in.

## Risks / Trade-offs

- **Cost & non-determinism** — every import makes a paid, non-deterministic API
  call; output can vary between calls and may hallucinate. Mitigated by
  pre-fill-not-save (human review) and schema validation; no caching in MVP.
- **Provider outage / missing key** — import is unavailable but the app is not;
  surfaced as a specific error, and manual create still works.
- **Prompt-injection / adversarial text** — pasted text is treated as data, not
  trusted; the model is instructed to output JSON only, and the response is
  schema-validated. No secrets are included in the prompt. Content of the pasted
  text is sent to the third-party provider (privacy note, see Open Questions).
- **Output drift from `createRecipeInputSchema`** — mitigated by reusing the
  shared `ingredientSchema`/`recipeMetadataSchema` in the draft schema and by D4.
- **Large input** — capped by `text.max(20000)`; note as a tuneable constant.

## Migration Plan

1. Add `recipeImportRequestSchema`, `recipeImportDraftSchema`,
   `recipeImportResponseSchema` to `shared` + tests.
2. Add `apps/api/src/lib/recipeImport.ts` (fetch + prompt + validate) and the
   `POST /recipes/import` route; add `AI_*` vars to `.env.example`.
3. Add `useImportRecipe` mutation to `apps/web/src/app/_hooks/recipes.ts`.
4. Add `initialData` to `RecipeForm`/`RecipeFormScene`.
5. Add `RecipeImportScene` + `recipes.import` route + recipes-page entry point.
6. Add i18n keys to all five locales.
7. `yarn verify` (and `yarn verify:full` for the API behavior).

Rollback: revert code; no schema/migration to reverse. Disable by unsetting
`AI_API_KEY` (import returns `ai_not_configured`).

## Open Questions

- **Draft transport between Import and Create scenes**: default `sessionStorage`;
  alternatives (URL param, module store) are fine if they clear after submit.
- **Privacy notice**: pasted recipe text leaves the server and goes to the
  provider — do we need a one-line disclosure in the import UI? Default: yes,
  a short "sent to AI provider" note.
- **Rate limiting / cost cap** on the import endpoint (e.g. per-user daily cap)?
  Default: none in MVP; revisit if abuse/cost becomes a concern.
- **Which AI provider and model** — deferred: explore options (OpenAI, Anthropic,
  open/local models) at implementation time and pick based on cost, quality, and
  privacy. Default for now: env-driven `AI_API_BASE_URL`/`AI_API_MODEL` with no
  provider lock-in.
