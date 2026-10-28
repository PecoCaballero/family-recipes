# search-by-ingredients Specification

## Purpose

TBD - created by archiving change search-by-ingredients. Update Purpose after archive.

## Requirements

### Requirement: Pantry is persistent and per-user

The system SHALL store a user's pantry ingredients as pantry items scoped to
that user, and SHALL only ever return the authenticated user's own pantry items.
Pantry items SHALL persist across sessions.

#### Scenario: Pantry items are scoped to the user

- **WHEN** two different users each add an ingredient to their pantry
- **THEN** each user's pantry list contains only their own items

### Requirement: User can view their pantry

The system SHALL allow an authenticated user to list their pantry items. Each
item SHALL include at least `id` and `name`.

#### Scenario: List pantry items

- **WHEN** an authenticated user requests `GET /v1/pantry`
- **THEN** the system returns the user's pantry items as an array of
  `{ id, name }`, ordered by when they were added

#### Scenario: Unauthenticated user cannot view a pantry

- **WHEN** an unauthenticated client requests `GET /v1/pantry`
- **THEN** the system returns a 401 error

### Requirement: User can add an ingredient to their pantry

The system SHALL allow an authenticated user to add an ingredient to their
pantry by name. Adding a name that already exists in the user's pantry
(case-insensitive) SHALL be rejected rather than duplicated.

#### Scenario: Add a new ingredient

- **WHEN** an authenticated user submits `POST /v1/pantry` with `{ name: "onion" }`
- **THEN** the system stores the item and returns 201 with the created
  `{ id, name }`

#### Scenario: Duplicate ingredient is rejected

- **WHEN** an authenticated user submits `POST /v1/pantry` with a name that is
  already in their pantry, ignoring case
- **THEN** the system returns a 409 error with `{ error: 'pantry_item_exists' }`
  and does not create a duplicate

#### Scenario: Empty or blank name is rejected

- **WHEN** an authenticated user submits `POST /v1/pantry` with an empty or
  whitespace-only name
- **THEN** the system returns a 400 error with
  `{ error: 'validation_error', details: [...] }`

### Requirement: User can remove an ingredient from their pantry

The system SHALL allow an authenticated user to remove one of their own pantry
items.

#### Scenario: Remove an existing item

- **WHEN** an authenticated user requests `DELETE /v1/pantry/:id` for one of
  their own items
- **THEN** the system deletes the item and returns 204

#### Scenario: Remove a non-existent or foreign item

- **WHEN** an authenticated user requests `DELETE /v1/pantry/:id` for an id that
  does not belong to them or does not exist
- **THEN** the system returns a 404 error

### Requirement: Suggestions are scored against the pantry

The system SHALL score each recipe visible to the user by how many of its
ingredient names are covered by the user's pantry, using case-insensitive
equality of normalized names (trimmed, lowercased). A pantry item covers an
ingredient only when the normalized names are equal. Substring and partial
matches (e.g. `egg` matching `eggplant`, or `milk` matching `chocolate milk`)
SHALL NOT count as coverage. A recipe whose ingredients are all covered SHALL
be marked `canMake`. A recipe with one or two missing ingredients SHALL be
marked `almost` and SHALL include the names of the missing ingredients. A recipe
with more than two missing ingredients SHALL be omitted.

#### Scenario: Fully covered recipe can be made

- **WHEN** a user's pantry covers every ingredient name of a recipe
- **THEN** the suggestion is marked `canMake` with `missingCount` 0

#### Scenario: Equality is case-insensitive

- **WHEN** a user's pantry contains `Onion` and a recipe ingredient is `onion`
- **THEN** the pantry item covers the ingredient

#### Scenario: Substring or partial match does not cover

- **WHEN** a user's pantry contains `egg` and a recipe ingredient is `eggplant`
- **THEN** `egg` does NOT cover `eggplant`, and `eggplant` is reported missing

#### Scenario: Compound names are not covered by their parts

- **WHEN** a user's pantry contains `milk` and a recipe ingredient is
  `chocolate milk`
- **THEN** `milk` does NOT cover `chocolate milk`, and it is reported missing

#### Scenario: Recipe missing one ingredient is "almost"

- **WHEN** a recipe has exactly one ingredient name not covered by the pantry
- **THEN** the suggestion is marked `almost` with `missingCount` 1 and
  `missingIngredients` containing that name

#### Scenario: Recipe missing more than two ingredients is omitted

- **WHEN** a recipe has three or more ingredient names not covered by the pantry
- **THEN** the recipe is not returned in the suggestions

#### Scenario: Suggestions are sorted best-first

- **WHEN** the system returns suggestions
- **THEN** `canMake` suggestions come before `almost` suggestions, and within
  each group suggestions are ordered by `missingCount` ascending

### Requirement: Suggestions respect recipe visibility

The suggestion endpoint SHALL consider only recipes visible to the requesting
user, using the same rules as recipe listing: the user is the author, the recipe
is `public`, or the recipe belongs to a group the user is a member of.

#### Scenario: A private recipe is never suggested to a non-author

- **WHEN** a user requests suggestions
- **THEN** recipes they cannot see (not authored by them, not public, not in a
  shared group) are excluded from the results

### Requirement: Suggest response includes scoring details

The suggest endpoint SHALL return, for each suggestion, the full recipe plus
`status` (`canMake` or `almost`), `missingCount`, and `missingIngredients`.

#### Scenario: Suggest response shape

- **WHEN** an authenticated user requests `GET /v1/pantry/suggest`
- **THEN** the response includes `suggestions`, each with the formatted recipe
  and its `status`, `missingCount`, and `missingIngredients`

### Requirement: Pantry is managed from the Search page

The web app SHALL let the user manage their pantry and view ingredient
suggestions from the Search page, without adding a new navigation destination.

#### Scenario: Pantry mode on the search page

- **WHEN** an authenticated user opens the Search page and switches to the
  pantry view
- **THEN** they can add and remove pantry items and see suggested recipes
  grouped into "You can make" and "Almost there"
