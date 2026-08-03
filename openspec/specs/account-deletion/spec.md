## Purpose

Account deletion allowing users to permanently remove their account and all associated data via a single transactional operation.

## Requirements

### Requirement: User can delete their account

The system SHALL allow an authenticated user to permanently delete their account and all associated data. The deletion SHALL be performed in a single database transaction and SHALL cascade through all related records. The operation is irreversible.

#### Scenario: Successful account deletion

- **WHEN** an authenticated user sends `DELETE /v1/users/me`
- **THEN** the system deletes all `RefreshToken` rows for the user
- **THEN** the system deletes all `SavedRecipe` rows for the user (removes saves/bookmarks)
- **THEN** the system deletes all `GroupMember` rows for the user (removes from groups)
- **THEN** the system deletes all `RecipeGroup` associations for recipes owned by the user
- **THEN** the system deletes all `Ingredient` rows for recipes owned by the user
- **THEN** the system deletes all `Recipe` rows authored by the user
- **THEN** the system deletes all `Group` rows owned by the user (cascades remaining members and recipe associations)
- **THEN** the system deletes the user's avatar file from `uploads/avatars/` if one exists
- **THEN** the system deletes the `User` row
- **THEN** the system returns a 200 response with `{ status: 'deleted' }`

#### Scenario: Account deletion without authentication

- **WHEN** an unauthenticated client sends `DELETE /v1/users/me`
- **THEN** the system returns a 401 error with `{ error: 'unauthorized' }`

#### Scenario: Account deletion is atomic

- **WHEN** an account deletion is initiated and a database error occurs mid-deletion
- **THEN** all operations within the transaction are rolled back
- **THEN** the User row and all associated data remain intact
- **THEN** the system returns a 500 error with `{ error: 'internal_error' }`

### Requirement: Deleted user cannot authenticate after deletion

The system SHALL invalidate all existing tokens for the deleted user. Any subsequent request using the deleted user's access token or refresh token SHALL be rejected.

#### Scenario: Access token rejected after deletion

- **WHEN** a client sends a request with an access token issued to a deleted user
- **THEN** the system returns a 401 error with `{ error: 'invalid_token' }`

#### Scenario: Refresh token rejected after deletion

- **WHEN** a client sends a refresh token belonging to a deleted user
- **THEN** the system returns a 401 error with `{ error: 'invalid_token' }`

### Requirement: User cannot delete account while group owner

The system SHALL prevent account deletion if the user owns any groups (i.e., is the `ownerId` of at least one `Group` row). The user MUST transfer ownership or delete all owned groups before deleting their account. A future `group-admin-array` change will replace single-owner with admin arrays, at which point this guard will check for sole remaining admin.

#### Scenario: Deletion blocked by group ownership

- **WHEN** an authenticated user who is the owner of at least one group sends `DELETE /v1/users/me`
- **THEN** the system queries `Group` rows where `ownerId = userId`
- **THEN** if any rows exist, the system returns a 409 error with `{ error: 'group_owner', detail: 'You own X group(s). Transfer ownership or delete them before deleting your account.', groups: [...] }`

#### Scenario: User owns no groups

- **WHEN** an authenticated user who is not the owner of any group sends `DELETE /v1/users/me`
- **THEN** the ownership check passes (no owned groups)
- **THEN** the system proceeds with account deletion

### Requirement: Frontend requires explicit confirmation for account deletion

The frontend SHALL present a confirmation dialog before sending the deletion request. The dialog SHALL include a warning that deletion is irreversible and all data (recipes, groups) will be permanently lost. The user SHALL type their email address as a confirmation step before the delete button becomes enabled.

#### Scenario: Delete button disabled until email confirmed

- **WHEN** the delete account dialog is open
- **THEN** the confirm delete button is disabled (grayed out, non-clickable)
- **THEN** the user must type their exact email address into a text field
- **THEN** the confirm delete button becomes enabled only after the typed email matches the authenticated user's email
