## MODIFIED Requirements

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

## ADDED Requirements

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
