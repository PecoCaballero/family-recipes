## MODIFIED Requirements

### Requirement: Group admins can add recipes to a group

The system SHALL allow group admins (any user with a GroupAdmin row) to add a
recipe to a group via `POST /v1/groups/:id/recipes` with `{ recipeId }`, only
when the acting admin is allowed to see that recipe (the admin is the author,
the recipe is `public`, or the recipe is already in a group the admin belongs
to). The operation SHALL be idempotent (upsert). Non-admins SHALL receive a 403
error. Recipes the admin cannot see SHALL NOT be added (404).

#### Scenario: Admin adds a visible recipe to group

- **WHEN** a group admin sends `POST /v1/groups/:id/recipes` with a `recipeId`
  they can see
- **THEN** the system upserts a RecipeGroup row linking the group and recipe
- **THEN** the system returns a 200 response with `{ group, recipe }`

#### Scenario: Admin cannot add an invisible recipe

- **WHEN** a group admin sends `POST /v1/groups/:id/recipes` with a `recipeId`
  for another user's private recipe not shared with the admin
- **THEN** the system returns a 404 error and does not create the association

#### Scenario: Non-admin cannot add recipe to group

- **WHEN** a non-admin authenticated user sends `POST /v1/groups/:id/recipes`
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`
