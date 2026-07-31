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

### Requirement: Any member can quit (leave) a group

The system SHALL allow any group member to leave a group via `POST /v1/groups/:id/quit`. The endpoint SHALL require a valid access token (authenticated user). If the requesting user is not a member, the system SHALL return 404 (do not leak group existence). The group owner SHALL NOT be allowed to quit unless they are the last and only remaining member. If the owner is the last member and quits, the group SHALL be deleted (cascade: all GroupMember rows, RecipeGroup rows, and the Group row itself are removed). Non-owner members SHALL be allowed to quit regardless of member count.

#### Scenario: Non-owner member quits successfully

- **WHEN** a non-owner group member sends `POST /v1/groups/:id/quit`
- **THEN** the system deletes the corresponding GroupMember row
- **THEN** the system returns a 200 response with `{ status: 'left' }`

#### Scenario: Owner quits as last member

- **WHEN** the group owner is the only member and sends `POST /v1/groups/:id/quit`
- **THEN** the system deletes the GroupMember row
- **THEN** the system deletes the Group row and cascades to RecipeGroup rows
- **THEN** the system returns a 200 response with `{ status: 'left', groupDeleted: true }`

#### Scenario: Owner cannot quit when other members exist

- **WHEN** the group owner sends `POST /v1/groups/:id/quit` but other members remain
- **THEN** the system returns a 400 error with `{ error: 'owner_must_transfer_or_delete' }`

#### Scenario: Non-member cannot quit

- **WHEN** a non-member authenticated user sends `POST /v1/groups/:id/quit`
- **THEN** the system returns a 404 error (does not reveal group exists)

#### Scenario: Unauthenticated user cannot quit

- **WHEN** an unauthenticated client sends `POST /v1/groups/:id/quit`
- **THEN** the system returns a 401 error

### Requirement: Group detail response includes member list with recipe counts

The `GET /v1/groups/:id` endpoint SHALL return a `members` array in the response. Each member object SHALL include the user's `id`, `name`, `email`, `avatar`, and a `recipeCount` field indicating how many recipes that member has authored that are shared with this group (count of Recipe rows authored by that user that have a RecipeGroup entry for this group). The response SHALL include the group owner as the first member in the array.

#### Scenario: Group detail includes members with recipe counts

- **WHEN** a group member requests `GET /v1/groups/:id`
- **THEN** the response includes `members: [{ id, name, email, avatar, recipeCount }, ...]`
- **THEN** `recipeCount` is the number of recipes that member authored and shared to this group
- **THEN** the group owner is included in the members array

#### Scenario: Member with no recipes in group shows zero

- **WHEN** a group member has authored no recipes shared with this group
- **THEN** that member's `recipeCount` is `0`

### Requirement: Delete group restricted to admin who is last remaining member

The `DELETE /v1/groups/:id` endpoint SHALL enforce that the requesting user is the group owner AND is the last remaining member before allowing deletion. If other members still exist in the group, the system SHALL return a 400 error. The existing requirement that only admins (owners) can delete groups remains unchanged; this adds the additional last-member constraint.

#### Scenario: Owner deletes group as last member

- **WHEN** the group owner sends `DELETE /v1/groups/:id` and is the only member
- **THEN** the system deletes the group and all related rows
- **THEN** the system returns a 204 response

#### Scenario: Owner cannot delete group with other members

- **WHEN** the group owner sends `DELETE /v1/groups/:id` but other members exist
- **THEN** the system returns a 400 error with `{ error: 'group_has_other_members' }`

#### Scenario: Non-admin cannot delete group

- **WHEN** a non-admin authenticated user sends `DELETE /v1/groups/:id`
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`
