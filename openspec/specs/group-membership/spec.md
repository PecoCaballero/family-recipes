## Purpose

TBD — Group membership management, member-based visibility gating for both groups and recipes, and recipe-group association population in API responses.

## Requirements

### Requirement: Group admins can add members to their group

The system SHALL allow group admins (owner or co-owner) to add a user to their group via `POST /v1/groups/:id/members/:userId`. The operation SHALL be idempotent (no error if already a member). Non-admins SHALL receive a 403 error.

#### Scenario: Admin adds a member

- **WHEN** a group admin sends `POST /v1/groups/:id/members/:userId`
- **THEN** the system inserts a GroupMember row if it doesn't exist
- **THEN** the system returns a 200 response with `{ status: 'added' }`

#### Scenario: Adding an existing member is idempotent

- **WHEN** a group admin adds a user who is already a member
- **THEN** the system returns a 200 response with `{ status: 'added' }` (no duplicate rows)

#### Scenario: Non-admin cannot add members

- **WHEN** a non-admin authenticated user sends `POST /v1/groups/:id/members/:userId`
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`

### Requirement: Group admins can remove members from their group

The system SHALL allow group admins (owner or co-owner) to remove a user from their group via `DELETE /v1/groups/:id/members/:userId`. The operation SHALL be idempotent (no error if not a member). The group owner SHALL NOT be removable (owner cannot leave/be removed). Non-admins SHALL receive a 403 error.

#### Scenario: Admin removes a member

- **WHEN** a group admin sends `DELETE /v1/groups/:id/members/:userId`
- **THEN** the system deletes the corresponding GroupMember row
- **THEN** the system returns a 200 response with `{ status: 'removed' }`

#### Scenario: Cannot remove the group owner

- **WHEN** a request attempts to remove the group owner (userId === group.ownerId)
- **THEN** the system returns a 400 error with `{ error: 'cannot_remove_owner' }`

#### Scenario: Removing a non-member is idempotent

- **WHEN** a group admin removes a user who is not a member
- **THEN** the system returns a 200 response with `{ status: 'removed' }` (no error)

#### Scenario: Non-admin cannot remove members

- **WHEN** a non-admin authenticated user sends `DELETE /v1/groups/:id/members/:userId`
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`

### Requirement: Group membership gates recipe visibility

The system SHALL include recipes shared to groups where the authenticated user is a member when listing recipes via `GET /v1/recipes`. A recipe SHALL be visible to a user if: the user is the author, the recipe has `visibility: 'public'`, or the recipe belongs to a group where the user is a member.

#### Scenario: Group member sees group-shared recipes

- **WHEN** an authenticated user who is a member of group G requests `GET /v1/recipes`
- **THEN** the system includes recipes that are associated with group G via RecipeGroup
- **THEN** those recipes include computed `isAuthor` and `isSaved` booleans

#### Scenario: Non-member does not see group recipes

- **WHEN** a user who is not a member of group G requests `GET /v1/recipes`
- **THEN** the system does NOT include recipes only visible through group G membership

### Requirement: formatRecipe populates groupIds from RecipeGroup

The system SHALL populate the `groupIds` field in recipe API responses from the RecipeGroup join table. Each recipe response SHALL include `groupIds` as an array of group UUID strings that the recipe belongs to.

#### Scenario: Recipe in one group

- **WHEN** a client retrieves a recipe that belongs to one group
- **THEN** `recipe.groupIds` includes the group's UUID

#### Scenario: Recipe in no groups

- **WHEN** a client retrieves a recipe that is not in any group
- **THEN** `recipe.groupIds` is `[]`
