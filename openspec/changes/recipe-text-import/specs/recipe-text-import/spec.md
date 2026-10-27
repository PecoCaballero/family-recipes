## ADDED Requirements

### Requirement: Authenticated user can import a recipe from pasted text

The system SHALL provide a `POST /v1/recipes/import` endpoint, available to
authenticated users, that accepts raw recipe text and returns a structured
draft. The request body SHALL contain `text` (a non-empty string of at most
20000 characters). The endpoint SHALL run the AI extraction server-side and
SHALL NOT persist anything; it only returns a draft for the user to review.

#### Scenario: Successful import

- **WHEN** an authenticated user submits `{ text: "..." }` containing a recipe
- **THEN** the API calls the configured AI provider with the pasted text
- **THEN** the API returns a 200 response with `{ draft: { name, description,
ingredients, instructions, ... } }` matching the import draft schema

#### Scenario: Import is non-persisting

- **WHEN** an authenticated user imports a recipe draft
- **THEN** no `Recipe`, `Ingredient`, or related rows are created
- **THEN** the draft is returned to the client only

#### Scenario: Empty or oversized text

- **WHEN** an authenticated user submits `text` that is empty, missing, or
  longer than 20000 characters
- **THEN** the API returns a 400 error with
  `{ error: 'validation_error', details: [...] }`

#### Scenario: Unauthenticated import

- **WHEN** an unauthenticated client calls `POST /v1/recipes/import`
- **THEN** the API returns a 401 error

### Requirement: Import uses a server-side, env-configured AI provider

The import endpoint SHALL call an AI provider configured via environment
variables — `AI_API_KEY` (required) and `AI_API_BASE_URL` / `AI_API_MODEL`
(optional) — so the provider can be swapped without code changes. The specific
provider SHALL be decided at implementation time. The provider key SHALL be used
only on the server and SHALL NOT be returned to or require exposure to the
client.

#### Scenario: Provider key stays server-side

- **WHEN** the web client requests an import
- **THEN** the web client sends only the pasted `text`; it never sends or
  receives the provider key

#### Scenario: Provider is env-configured

- **WHEN** `AI_API_KEY`, `AI_API_BASE_URL`, and `AI_API_MODEL` are set
- **THEN** the import call uses those values to reach and configure the
  provider

### Requirement: Import fails explicitly, never by guessing

The import endpoint SHALL return a specific, actionable error when extraction
cannot proceed, and SHALL NOT fabricate a recipe.

#### Scenario: Provider not configured

- **WHEN** an authenticated user requests an import and `AI_API_KEY` is not set
- **THEN** the API returns a 503 error with `{ error: 'ai_not_configured' }`

#### Scenario: Provider call fails

- **WHEN** the AI provider request fails, times out, or returns a non-2xx status
- **THEN** the API returns a 502 error with `{ error: 'ai_upstream_error' }`

#### Scenario: Unparseable output

- **WHEN** the provider response cannot be parsed, fails the import draft schema
  validation, or contains no recipe (e.g. empty `ingredients` or `instructions`)
- **THEN** the API returns a 422 error with `{ error: 'import_unparseable' }`

### Requirement: Import draft is submit-compatible with recipe creation

The import response SHALL return a `draft` whose fields are compatible with the
existing `createRecipeInputSchema` pre-fill (minus `image` and `parentRecipeId`).
`ingredients` SHALL match `ingredientSchema`; optional `cuisine`, `prepTime`,
`cookTime`, `servings`, and `difficulty` SHALL match `recipeMetadataSchema`.

#### Scenario: Draft shape

- **WHEN** an import succeeds
- **THEN** the returned `draft` includes `name`, `description`, `ingredients`
  (array of `{ name, quantity, unit? }`), and `instructions`, plus any extracted
  metadata fields

#### Scenario: Missing description defaulted

- **WHEN** the extracted recipe has no usable description
- **THEN** the API SHALL default `draft.description` to the extracted `name` so
  the draft remains submittable

### Requirement: Web UI pastes text and pre-fills the create form

The web app SHALL provide an Import entry point that lets the user paste recipe
text, view a parsed preview, and then pre-fill the existing create-recipe form
for review and manual submission. The existing `RecipeForm` and create flow SHALL
be reused, not duplicated.

#### Scenario: Open import and paste text

- **WHEN** a user taps the Import entry point on the recipes page
- **THEN** an import scene opens with a text area to paste the recipe text

#### Scenario: Parse shows a preview

- **WHEN** a user pastes text and taps the parse action
- **THEN** the app calls `POST /v1/recipes/import`
- **THEN** a preview of the extracted name, ingredients, instructions, and
  metadata is shown

#### Scenario: Continue pre-fills the create form

- **WHEN** a user taps "Use this recipe" on the preview
- **THEN** the create-recipe form opens pre-filled with the draft, and the user
  can edit and submit it through the normal create flow

#### Scenario: Import error shown

- **WHEN** the import call returns an error (unconfigured, upstream, or
  unparseable)
- **THEN** the import scene shows an error message and does not navigate to the
  create form

#### Scenario: Import never auto-saves

- **WHEN** a draft is previewed and pre-filled
- **THEN** nothing is persisted until the user explicitly submits the create
  form
