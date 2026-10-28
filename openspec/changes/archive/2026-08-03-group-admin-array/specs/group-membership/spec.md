## MODIFIED Requirements

### Requirement: Group admins can add members to their group

The system SHALL allow group admins (any user with a GroupAdmin row) to add a user to their group via `POST /v1/groups/:id/members/:userId`. The operation SHALL be idempotent (no error if already a member). Non-admins SHALL receive a 403 error.

#### Scenario: Admin adds a member

- **WHEN** a group admin sends `POST /v1/groups/:id/members/:userId`
- **THEN** the system verifies the user is an admin via GroupAdmin table
- **THEN** the system inserts a GroupMember row if it doesn't exist
- **THEN** the system returns a 200 response with `{ status: 'added' }`

#### Scenario: Adding an existing member is idempotent

- **WHEN** a group admin adds a user who is already a member
- **THEN** the system returns a 200 response with `{ status: 'added' }` (no duplicate rows)

#### Scenario: Non-admin cannot add members

- **WHEN** a non-admin authenticated user sends `POST /v1/groups/:id/members/:userId`
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`

### Requirement: Group admins can remove members from their group

The system SHALL allow group admins (any user with a GroupAdmin row) to remove a user from their group via `DELETE /v1/groups/:id/members/:userId`. The operation SHALL also remove the user's GroupAdmin row if one exists (removing a member removes their admin status). The operation SHALL be idempotent (no error if not a member). A group's sole admin SHALL NOT be removable if other members remain (group must always have at least one admin while members exist). Non-admins SHALL receive a 403 error.

#### Scenario: Admin removes a member who is also an admin

- **WHEN** a group admin (who is not the sole admin) sends `DELETE /v1/groups/:id/members/:userId` for another admin
- **THEN** the system deletes the corresponding GroupMember row
- **THEN** the system deletes the corresponding GroupAdmin row
- **THEN** the system returns a 200 response with `{ status: 'removed' }`

#### Scenario: Admin removes a non-admin member

- **WHEN** a group admin sends `DELETE /v1/groups/:id/members/:userId` for a non-admin member
- **THEN** the system deletes the corresponding GroupMember row
- **THEN** the system returns a 200 response with `{ status: 'removed' }`

#### Scenario: Cannot remove sole admin when other members exist

- **WHEN** a request attempts to remove the only admin of a group that has other members
- **THEN** the system returns a 400 error with `{ error: 'cannot_remove_sole_admin', detail: 'Group must have at least one admin while members exist' }`

#### Scenario: Sole admin can be removed as last member

- **WHEN** a request attempts to remove the only admin who is also the only remaining member
- **THEN** the system deletes the GroupMember and GroupAdmin rows
- **THEN** the system returns a 200 response with `{ status: 'removed' }`

#### Scenario: Removing a non-member is idempotent

- **WHEN** a group admin removes a user who is not a member
- **THEN** the system returns a 200 response with `{ status: 'removed' }` (no error)

#### Scenario: Non-admin cannot remove members

- **WHEN** a non-admin authenticated user sends `DELETE /v1/groups/:id/members/:userId`
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`

### Requirement: Any member can quit (leave) a group

The system SHALL allow any group member to leave a group via `POST /v1/groups/:id/quit`. The endpoint SHALL require a valid access token (authenticated user). If the requesting user is not a member, the system SHALL return 404 (do not leak group existence). If the requesting user is an admin, their GroupAdmin row SHALL also be removed. A sole admin SHALL NOT be allowed to quit if other members remain in the group. If the quitting user is the last and only remaining member (and sole admin if applicable), the group SHALL be deleted (cascade: all GroupAdmin rows, GroupMember rows, RecipeGroup rows, and the Group row itself are removed). Non-admin members SHALL be allowed to quit regardless of member count.

#### Scenario: Non-admin member quits successfully

- **WHEN** a non-admin group member sends `POST /v1/groups/:id/quit`
- **THEN** the system deletes the corresponding GroupMember row
- **THEN** the system returns a 200 response with `{ status: 'left', groupDeleted: false }`

#### Scenario: Admin quits when another admin exists

- **WHEN** an admin who is not the sole admin sends `POST /v1/groups/:id/quit` and at least one other admin exists
- **THEN** the system deletes the GroupMember row and the GroupAdmin row
- **THEN** the system returns a 200 response with `{ status: 'left', groupDeleted: false }`

#### Scenario: Sole admin quits as last member

- **WHEN** the sole admin is the only member and sends `POST /v1/groups/:id/quit`
- **THEN** the system deletes the GroupMember and GroupAdmin rows
- **THEN** the system deletes the Group row and cascades to RecipeGroup rows
- **THEN** the system returns a 200 response with `{ status: 'left', groupDeleted: true }`

#### Scenario: Sole admin cannot quit when other members exist

- **WHEN** the sole admin sends `POST /v1/groups/:id/quit` but other non-admin members remain
- **THEN** the system returns a 400 error with `{ error: 'sole_admin_must_promote_or_delete' }`

#### Scenario: Non-member cannot quit

- **WHEN** a non-member authenticated user sends `POST /v1/groups/:id/quit`
- **THEN** the system returns a 404 error (does not reveal group exists)

#### Scenario: Unauthenticated user cannot quit

- **WHEN** an unauthenticated client sends `POST /v1/groups/:id/quit`
- **THEN** the system returns a 401 error

### Requirement: Delete group restricted to admin who is last remaining member

The `DELETE /v1/groups/:id` endpoint SHALL enforce that the requesting user is a group admin (via GroupAdmin table) AND is the last remaining member before allowing deletion. If other members still exist in the group, the system SHALL return a 400 error. Non-admins SHALL receive a 403 error.

#### Scenario: Admin deletes group as last member

- **WHEN** a group admin sends `DELETE /v1/groups/:id` and is the only member
- **THEN** the system verifies the user is an admin via GroupAdmin table
- **THEN** the system deletes the group and all related rows (GroupAdmin, GroupMember, RecipeGroup cascade)
- **THEN** the system returns a 204 response

#### Scenario: Admin cannot delete group with other members

- **WHEN** a group admin sends `DELETE /v1/groups/:id` but other members exist
- **THEN** the system returns a 400 error with `{ error: 'group_has_other_members' }`

#### Scenario: Non-admin cannot delete group

- **WHEN** a non-admin authenticated user sends `DELETE /v1/groups/:id`
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`

## ADDED Requirements

### Requirement: Group admins can add another admin

The system SHALL allow group admins (any user with a GroupAdmin row) to promote another member to admin via `POST /v1/groups/:id/admins`. The promoted user SHALL already be a group member. The operation SHALL be idempotent (no error if already an admin). Non-admins SHALL receive a 403 error.

#### Scenario: Admin promotes a member to admin

- **WHEN** a group admin sends `POST /v1/groups/:id/admins` with `{ userId }`
- **THEN** the system verifies the userId is a group member
- **THEN** the system inserts a GroupAdmin row if it doesn't exist
- **THEN** the system returns a 200 response with `{ status: 'added' }`

#### Scenario: Cannot promote a non-member to admin

- **WHEN** a group admin sends `POST /v1/groups/:id/admins` with a userId that is not a group member
- **THEN** the system returns a 400 error with `{ error: 'user_not_member' }`

#### Scenario: Non-admin cannot promote

- **WHEN** a non-admin authenticated user sends `POST /v1/groups/:id/admins`
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`

### Requirement: Group admins can remove another admin

The system SHALL allow group admins to remove another admin's admin status via `DELETE /v1/groups/:id/admins/:userId`. The operation SHALL NOT remove the user from the group (they remain a member). The sole admin of a group with other members SHALL NOT be removable. Non-admins SHALL receive a 403 error.

#### Scenario: Admin removes another admin

- **WHEN** a group admin sends `DELETE /v1/groups/:id/admins/:userId` for another admin (not the sole admin)
- **THEN** the system deletes the corresponding GroupAdmin row
- **THEN** the user remains as a GroupMember (not removed from group)
- **THEN** the system returns a 200 response with `{ status: 'removed' }`

#### Scenario: Cannot remove sole admin from group with members

- **WHEN** a request attempts to remove the only admin from a group that has other members
- **THEN** the system returns a 400 error with `{ error: 'cannot_remove_sole_admin' }`

#### Scenario: Admin cannot remove themselves if sole admin with members

- **WHEN** the sole admin of a group with other members sends `DELETE /v1/groups/:id/admins/:userId` for themselves
- **THEN** the system returns a 400 error with `{ error: 'cannot_remove_sole_admin' }`

#### Scenario: Non-admin cannot remove admins

- **WHEN** a non-admin authenticated user sends `DELETE /v1/groups/:id/admins/:userId`
- **THEN** the system returns a 403 error with `{ error: 'forbidden' }`
