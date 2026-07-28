## ADDED Requirements

### Requirement: Group admins can delete their group

The system SHALL allow group admins (owner or co-owner) to delete a group. Deletion SHALL cascade: all GroupMember rows, RecipeGroup rows, and the Group row itself are removed. Non-admins SHALL receive a 403 error. The endpoint SHALL require a valid access token.

#### Scenario: Admin deletes their group

- **WHEN** a group admin sends `DELETE /v1/groups/:id`
- **THEN** the system deletes the group and all related GroupMember and RecipeGroup rows in a transaction
- **THEN** the system returns a 204 response with no body

#### Scenario: Non-admin cannot delete group

- **WHEN** a non-admin authenticated user sends `DELETE /v1/groups/:id`
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`

#### Scenario: Unauthenticated user cannot delete group

- **WHEN** an unauthenticated client sends `DELETE /v1/groups/:id`
- **THEN** the system returns a 401 error

### Requirement: Group admins can update their group

The system SHALL allow group admins (owner or co-owner) to update group fields (name, description, icon). Non-admins SHALL receive a 403 error.

#### Scenario: Admin updates their group

- **WHEN** a group admin sends `PATCH /v1/groups/:id` with valid fields
- **THEN** the system updates the group row and returns a 200 response with the updated group

#### Scenario: Non-admin cannot update group

- **WHEN** a non-admin authenticated user sends `PATCH /v1/groups/:id`
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`

### Requirement: Group members can add recipes to a group

The system SHALL allow any group member to add a recipe to a group via `POST /v1/groups/:id/recipes` with `{ recipeId }`. The operation SHALL be idempotent (upsert). Non-members SHALL receive a 403 error.

#### Scenario: Member adds recipe to group

- **WHEN** a group member sends `POST /v1/groups/:id/recipes` with `{ recipeId }`
- **THEN** the system upserts a RecipeGroup row linking the group and recipe
- **THEN** the system returns a 200 response with `{ status: 'added' }`

#### Scenario: Non-member cannot add recipe to group

- **WHEN** a non-member authenticated user sends `POST /v1/groups/:id/recipes`
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`

### Requirement: Members can remove their recipes from a group; admins can remove any

The system SHALL allow any group member to remove their own recipe from a group via `POST /v1/groups/:id/remove-recipe` with `{ recipeId }`. Group admins (owner or co-owner) SHALL be allowed to remove any recipe from the group. The operation SHALL be idempotent (no error if not in group). Non-members SHALL receive a 403 error. Non-admin members attempting to remove another user's recipe SHALL receive a 403 error.

#### Scenario: Member removes their own recipe from group

- **WHEN** a group member sends `POST /v1/groups/:id/remove-recipe` with `{ recipeId }` for a recipe they authored
- **THEN** the system deletes the corresponding RecipeGroup row
- **THEN** the system returns a 200 response with `{ status: 'removed' }`

#### Scenario: Admin removes any recipe from group

- **WHEN** a group admin sends `POST /v1/groups/:id/remove-recipe` with `{ recipeId }` for any recipe in the group
- **THEN** the system deletes the corresponding RecipeGroup row
- **THEN** the system returns a 200 response with `{ status: 'removed' }`

#### Scenario: Non-admin member cannot remove another user's recipe

- **WHEN** a non-admin group member sends `POST /v1/groups/:id/remove-recipe` with `{ recipeId }` for a recipe they did NOT author
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`

#### Scenario: Removing a recipe not in the group is idempotent

- **WHEN** an authorized user sends `POST /v1/groups/:id/remove-recipe` for a recipe not in the group
- **THEN** the system returns a 200 response with `{ status: 'removed' }` (no error)

### Requirement: List groups returns groups where user is a member

The system SHALL return all groups where the authenticated user is a member (via GroupMember join table). Each group object SHALL include `recipeIds` populated from RecipeGroup rows. The endpoint SHALL support optional `?search=` filtering on group name (case-insensitive).

#### Scenario: List user's groups

- **WHEN** an authenticated user requests `GET /v1/groups`
- **THEN** the system returns only groups where the user has a GroupMember row
- **THEN** each group includes `recipeIds` array populated from the RecipeGroup join table

#### Scenario: Search groups by name

- **WHEN** an authenticated user requests `GET /v1/groups?search=dinner`
- **THEN** the system returns only matching groups where the user is a member

#### Scenario: User has no groups

- **WHEN** an authenticated user with no group memberships requests `GET /v1/groups`
- **THEN** the system returns a 200 response with `{ groups: [] }`

### Requirement: Get group detail returns recipes and isAdmin flag

The system SHALL return a single group by ID with its recipes (including ingredients) and an `isAdmin` boolean (true when the user is the owner or a co-owner). The user SHALL be a member of the group to view it; non-members SHALL receive 404 (do not leak group existence).

#### Scenario: Member views group detail

- **WHEN** a group member requests `GET /v1/groups/:id`
- **THEN** the system returns `{ group, recipes, isAdmin }`
- **THEN** `isAdmin` is true when the user is the group owner or has a co-owner role on their GroupMember row
- **THEN** the `group` object includes `recipeIds` populated from RecipeGroup rows

#### Scenario: Non-member cannot view group

- **WHEN** a non-member authenticated user requests `GET /v1/groups/:id`
- **THEN** the system returns a 404 error (does not reveal group exists)

### Requirement: Authenticated user can create a group

The system SHALL allow any authenticated user to create a group by providing `name`, `description`, and optional `icon`. The creating user SHALL be set as the group owner and automatically added as a member via GroupMember row.

#### Scenario: Create group with valid data

- **WHEN** an authenticated user submits `{ name, description }` with optional `icon`
- **THEN** the system inserts a Group row with `ownerId` set to the user's ID
- **THEN** the system inserts a GroupMember row for the owner
- **THEN** the system returns a 201 response with the created group

#### Scenario: Create group missing required fields

- **WHEN** an authenticated user submits a group missing `name` or `description`
- **THEN** the system returns a 400 error with `{ error: 'validation_error' }`

### Requirement: Group responses include recipeIds

The system SHALL include a `recipeIds` field (array of recipe UUID strings) in every group API response. The field SHALL be populated from the RecipeGroup join table. The shared `Group` type SHALL be updated to reflect that `recipeIds` is now populated from the database rather than being always empty.

#### Scenario: Group list includes recipeIds

- **WHEN** a client requests `GET /v1/groups` or `GET /v1/groups/:id`
- **THEN** each group object includes `recipeIds` with actual recipe IDs from RecipeGroup
- **THEN** `recipeIds` is `[]` if the group has no recipes
