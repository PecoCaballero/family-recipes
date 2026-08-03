## MODIFIED Requirements

### Requirement: Admin can kick members from the settings page

The system SHALL allow group admins (any user with a GroupAdmin row) to remove members from the settings page. Each member row (except the viewing admin themselves) SHALL have a remove button triggered via an icon or menu action. The admin viewing the page SHALL NOT see a remove button on themselves. If the member being removed is also an admin, the removal SHALL succeed only if they are not the sole admin of a group with other members. On confirmation, the system SHALL call `DELETE /v1/groups/:id/members/:userId`. The member list SHALL refresh to reflect the removal. The remove operation SHALL also delete the user's GroupAdmin row if they are an admin.

#### Scenario: Admin kicks a member

- **WHEN** an admin clicks the remove action on a non-admin member row and confirms
- **THEN** the system calls `DELETE /v1/groups/:id/members/:userId`
- **THEN** on success, the member is removed from the displayed list
- **THEN** a success notification is shown

#### Scenario: Admin kicks another admin

- **WHEN** an admin clicks the remove action on another admin (not the sole admin) and confirms
- **THEN** the system calls `DELETE /v1/groups/:id/members/:userId`
- **THEN** on success, the user is removed from both GroupMember and GroupAdmin
- **THEN** the member and admin lists refresh

#### Scenario: Admin cannot be kicked if they are the sole admin with other members

- **WHEN** an admin attempts to kick the only other admin from a group that has other members
- **THEN** the server returns 400 `cannot_remove_sole_admin`
- **THEN** the UI displays the error message

#### Scenario: Non-admin does not see kick actions

- **WHEN** a non-admin member views the settings page
- **THEN** no kick/remove buttons are visible on any member row

### Requirement: Any member can quit (leave) a group from the settings page

The system SHALL allow any group member to leave a group via a "Leave Group" action on the settings page. On confirmation, the system SHALL call `POST /v1/groups/:id/quit`. If the user is an admin, their GroupAdmin row SHALL also be removed. A sole admin SHALL NOT be able to quit if other members remain. On success (non-delete), the user SHALL be redirected to `/groups`. On group deletion (last member quits), the user SHALL be redirected to `/groups`.

#### Scenario: Non-admin member quits a group

- **WHEN** a non-admin member clicks "Leave Group" and confirms the dialog
- **THEN** the system calls `POST /v1/groups/:id/quit`
- **THEN** on success, the user is redirected to `/groups`
- **THEN** the group no longer appears in the user's groups list

#### Scenario: Admin quits when another admin exists

- **WHEN** an admin who is not the sole admin clicks "Leave Group" and confirms
- **THEN** the system calls `POST /v1/groups/:id/quit`
- **THEN** on success, the user is redirected to `/groups`

#### Scenario: Sole admin quits when last member

- **WHEN** the sole admin is the only remaining member and clicks "Leave Group"
- **THEN** the system accepts the quit request
- **THEN** the group is deleted
- **THEN** the user is redirected to `/groups`

#### Scenario: Sole admin cannot quit when other members exist

- **WHEN** the sole admin tries to quit but other non-admin members remain
- **THEN** the server returns a 400 error with `{ error: 'sole_admin_must_promote_or_delete' }`
- **THEN** the UI displays the error message

#### Scenario: Quit confirmation dialog

- **WHEN** any member clicks "Leave Group"
- **THEN** a confirmation dialog appears with the leave group warning message
- **THEN** the member must confirm before the quit API call is made

### Requirement: Admin can navigate to edit page from settings

The system SHALL provide a navigation action on the settings page that directs group admins (any user with a GroupAdmin row) to the group edit page (`/groups/:id/edit`). The edit action SHALL be visible only to admins. Non-admins SHALL not see the edit navigation.

#### Scenario: Admin navigates to edit from settings

- **WHEN** an admin clicks the edit action on the settings page
- **THEN** the user is navigated to `/groups/:id/edit`

#### Scenario: Non-admin does not see edit action

- **WHEN** a non-admin views the settings page
- **THEN** the edit navigation action is not visible

### Requirement: Admin can delete group from settings (last-member-only restriction)

The system SHALL provide a delete group action on the settings page visible only to admins (any user with a GroupAdmin row). When triggered, a confirmation dialog SHALL appear. On confirmation, the system SHALL call `DELETE /v1/groups/:id`. The server SHALL enforce that the admin is the last and only member before allowing deletion. If other members still exist, the server SHALL return a 400 error. On success, the user SHALL be redirected to `/groups`.

#### Scenario: Admin deletes group as last member

- **WHEN** an admin is the only remaining member, clicks delete, and confirms
- **THEN** the system calls `DELETE /v1/groups/:id`
- **THEN** on 204 response, the user is redirected to `/groups`

#### Scenario: Admin cannot delete group with other members

- **WHEN** an admin clicks delete but other members still exist in the group
- **THEN** the server returns a 400 error with `{ error: 'group_has_other_members' }`
- **THEN** the UI displays the error message

#### Scenario: Non-admin does not see delete action

- **WHEN** a non-admin views the settings page
- **THEN** the delete group action is not visible
