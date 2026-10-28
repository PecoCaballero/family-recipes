## MODIFIED Requirements

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

The system SHALL return a single recipe by its ID. The recipe SHALL include its ingredients (as array), nested recipes (via `parentRecipeId` relation), and `groupIds` (populated from RecipeGroup). The response SHALL include computed `isAuthor` and `isSaved` booleans.

#### Scenario: Retrieve existing recipe

- **WHEN** an authenticated user requests `GET /v1/recipes/:id`
- **THEN** the system returns the recipe with ingredients, nested recipes, and `groupIds`
- **THEN** `isAuthor` is true if `authorId === authenticated userId`
- **THEN** `groupIds` is an array of group UUIDs the recipe belongs to

#### Scenario: Recipe not found

- **WHEN** an authenticated user requests `GET /v1/recipes/:id` for a non-existent ID
- **THEN** the system returns a 404 error with `{ error: 'recipe_not_found' }`
