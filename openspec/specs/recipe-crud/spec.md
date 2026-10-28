## Purpose

TBD — Recipe CRUD operations for the family-recipes API. Covers creating, listing, searching, retrieving, updating, deleting recipes, and saving/unsaving recipes.

## Requirements

### Requirement: Authenticated user can create a recipe

The system SHALL allow an authenticated user to create a new recipe. The request body SHALL include `name`, `description`, `ingredients`, and `instructions`. The system SHALL assign the authenticated user as `authorId` and `author`. On success, the system SHALL return the created recipe with computed `isAuthor: true` and `isSaved: false`.

#### Scenario: Create recipe with valid data

- **WHEN** an authenticated user submits `{ name, description, ingredients: [...], instructions }`
- **THEN** the system inserts a Recipe row and Ingredient rows in a transaction
- **THEN** the system returns a 201 response with the full recipe object

#### Scenario: Create recipe with optional fields

- **WHEN** an authenticated user submits a recipe with optional `image` and `parentRecipeId`
- **THEN** the system stores all provided fields
- **THEN** `parentRecipeId` creates a nested recipe relationship

#### Scenario: Create recipe missing required fields

- **WHEN** an authenticated user submits a recipe missing `name`, `description`, `ingredients`, or `instructions`
- **THEN** the system returns a 400 error with `{ error: 'validation_error', details: [...] }`

#### Scenario: Unauthenticated user cannot create a recipe

- **WHEN** an unauthenticated client attempts to create a recipe
- **THEN** the system returns a 401 error

### Requirement: Users can list recipes with search filtering

The system SHALL return a paginated list of recipes visible to the requesting user. The endpoint SHALL support an optional `?search=` query parameter that filters by name, description, or ingredient name (case-insensitive). Each recipe SHALL include computed `isAuthor` and `isSaved` booleans relative to the authenticated user. Each recipe SHALL include `groupIds` populated from the RecipeGroup join table.

A recipe SHALL be visible to a user if ANY of the following conditions are met:

- The user is the author (`authorId === userId`)
- The recipe has `visibility: 'public'`
- The recipe belongs to a group where the user is a member (via RecipeGroup → GroupMember)

#### Scenario: List all visible recipes

- **WHEN** an authenticated user requests `GET /v1/recipes`
- **THEN** the system returns recipes where the user is the author OR the recipe has `visibility: 'public'` OR the recipe is in a group the user belongs to
- **THEN** each recipe includes `isAuthor` and `isSaved` computed from the user's ID
- **THEN** each recipe includes `groupIds` populated from RecipeGroup associations

#### Scenario: Search recipes by query

- **WHEN** an authenticated user requests `GET /v1/recipes?search=chicken`
- **THEN** the system returns only recipes where name, description, or any ingredient name contains "chicken" (case-insensitive)
- **THEN** results are still filtered by visibility rules (author, public, or group membership)

#### Scenario: Group-shared recipes are visible to members

- **WHEN** a user who is a member of group G requests `GET /v1/recipes`
- **THEN** the system includes recipes associated with group G via RecipeGroup
- **THEN** those recipes include `groupIds` containing group G's UUID

#### Scenario: Unauthenticated user cannot list recipes

- **WHEN** an unauthenticated client requests `GET /v1/recipes`
- **THEN** the system returns a 401 error

### Requirement: Users can retrieve a single recipe by ID

The system SHALL return a single recipe by its ID only when the requesting user
is allowed to see it: the user is the author, the recipe has
`visibility: 'public'`, or the recipe belongs to a group where the user is a
member. Requests for recipes the user cannot see SHALL return a 404 (not 403)
to avoid leaking the recipe's existence. The response SHALL include ingredients
(as array), nested recipes (via `parentRecipeId` relation), and `groupIds`
(populated from RecipeGroup), plus computed `isAuthor` and `isSaved` booleans.

#### Scenario: Retrieve a visible recipe

- **WHEN** an authenticated user requests `GET /v1/recipes/:id` for a recipe
  they authored, is public, or is shared with a group they belong to
- **THEN** the system returns the recipe with ingredients, nested recipes, and `groupIds`
- **THEN** `isAuthor` is true if `authorId === authenticated userId`

#### Scenario: Cannot retrieve another user's private recipe

- **WHEN** an authenticated user requests `GET /v1/recipes/:id` for a private
  recipe authored by someone else, not shared with any group they belong to
- **THEN** the system returns a 404 error with `{ error: 'recipe_not_found' }`

#### Scenario: Recipe not found

- **WHEN** an authenticated user requests `GET /v1/recipes/:id` for a non-existent ID
- **THEN** the system returns a 404 error with `{ error: 'recipe_not_found' }`

### Requirement: Recipe author can update their recipe

The system SHALL allow the recipe author to update their recipe. Non-authors SHALL receive a 403 error. On update, ingredients SHALL be replaced wholesale (delete old, insert new).

#### Scenario: Author updates their recipe

- **WHEN** the recipe author sends `PATCH /v1/recipes/:id` with updated fields
- **THEN** the system updates the Recipe row and replaces Ingredient rows in a transaction
- **THEN** the system returns a 200 response with the updated recipe

#### Scenario: Non-author cannot update recipe

- **WHEN** a non-author authenticated user sends `PATCH /v1/recipes/:id`
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`

### Requirement: Recipe author can delete their recipe

The system SHALL allow the recipe author to delete their recipe. Deletion SHALL cascade: ingredients, saved recipe entries, and recipe-group associations for that recipe are also removed.

#### Scenario: Author deletes their recipe

- **WHEN** the recipe author sends `DELETE /v1/recipes/:id`
- **THEN** the system deletes the recipe and all related rows in a transaction
- **THEN** the system returns a 204 response with no body

#### Scenario: Non-author cannot delete recipe

- **WHEN** a non-author authenticated user sends `DELETE /v1/recipes/:id`
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`

#### Scenario: Deleting a non-existent recipe

- **WHEN** an authenticated user sends `DELETE /v1/recipes/:id` for a non-existent ID
- **THEN** the system returns a 404 error with `{ error: 'recipe_not_found' }`

### Requirement: User can save and unsave recipes

The system SHALL allow any authenticated user to save or unsave a recipe. Saving SHALL create a SavedRecipe row. Unsaving SHALL delete it. Saving a recipe multiple times SHALL be idempotent (no error).

#### Scenario: User saves a recipe

- **WHEN** an authenticated user sends `POST /v1/recipes/:id/save`
- **THEN** a SavedRecipe row is created linking user and recipe
- **THEN** the system returns a 200 response with `{ status: 'saved' }`

#### Scenario: User unsaves a recipe

- **WHEN** an authenticated user sends `POST /v1/recipes/:id/unsave`
- **THEN** the corresponding SavedRecipe row is deleted
- **THEN** the system returns a 200 response with `{ status: 'unsaved' }`

#### Scenario: Saving an already-saved recipe is idempotent

- **WHEN** a user saves a recipe they already saved
- **THEN** the system returns a 200 response with `{ status: 'saved' }` (no duplicate rows)

#### Scenario: Unsaving a non-saved recipe is idempotent

- **WHEN** a user unsaves a recipe they have not saved
- **THEN** the system returns a 200 response with `{ status: 'unsaved' }` (no error)

### Requirement: Recipe-side add-to-group enforces membership and visibility

The system SHALL allow a user to attach a recipe to a group via
`POST /v1/recipes/:id/groups` with `{ groupId }` only when (a) the user is a
member of that group and (b) the user is allowed to see the recipe (author,
`public`, or group member). Otherwise the system SHALL return 403/404 without
creating the association.

#### Scenario: Member shares a visible recipe

- **WHEN** a group member sends `POST /v1/recipes/:id/groups` for a recipe they
  can see
- **THEN** the system upserts the RecipeGroup row and returns a 200

#### Scenario: Non-member cannot attach to the group

- **WHEN** a user who is not a member of the group sends
  `POST /v1/recipes/:id/groups`
- **THEN** the system returns a 403 or 404 error and does not create the
  association

#### Scenario: Cannot attach an invisible recipe

- **WHEN** a group member sends `POST /v1/recipes/:id/groups` for a recipe they
  cannot see (another user's private recipe not shared with them)
- **THEN** the system returns a 404 error and does not expose the recipe to the
  group
