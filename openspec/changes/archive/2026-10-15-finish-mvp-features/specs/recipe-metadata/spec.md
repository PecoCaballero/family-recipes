## ADDED Requirements

### Requirement: Recipes expose optional metadata

The system SHALL support optional recipe metadata — `cuisine` (string),
`prepTime` (integer minutes), `cookTime` (integer minutes), `servings`
(integer), and `difficulty` (enumerated) — across the shared schemas, the API,
and the web UI. All metadata fields SHALL be optional and SHALL default to
absent when not provided.

#### Scenario: Create recipe with metadata

- **WHEN** an authenticated user creates a recipe including `cuisine`,
  `prepTime`, `cookTime`, `servings`, and `difficulty`
- **THEN** the system stores and returns those values on the recipe

#### Scenario: Create recipe without metadata

- **WHEN** an authenticated user creates a recipe omitting all metadata fields
- **THEN** the system creates the recipe successfully with metadata absent
  (no validation error)

#### Scenario: Update recipe metadata

- **WHEN** the recipe author updates a recipe with new metadata values
- **THEN** the system persists and returns the updated metadata

#### Scenario: Recipe detail displays metadata

- **WHEN** a user opens a recipe that has metadata
- **THEN** the web UI displays prep time, cook time, servings, difficulty, and
  cuisine in the recipe detail view

### Requirement: Recipe metadata is validated

The system SHALL validate metadata: `prepTime`, `cookTime`, and `servings` SHALL
be positive integers when present, and `difficulty` SHALL be one of the allowed
values.

#### Scenario: Invalid metadata rejected

- **WHEN** a user submits a recipe with a negative `prepTime` or an unknown
  `difficulty`
- **THEN** the system returns a 400 error with
  `{ error: 'validation_error', details: [...] }`
