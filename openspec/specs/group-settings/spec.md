## Purpose

TBD — Group settings page at `/groups/:id/settings` providing group information display, member management (kick), quit/leave functionality, edit navigation, and delete with last-member-only restriction. Fully i18n-aware.

## Requirements

### Requirement: Group settings page displays group information and member list

The system SHALL provide a group settings page at `/groups/:id/settings` accessible only to group members. The page SHALL display the group's icon, name, and description as read-only summary at the top. Below the summary, the page SHALL display a list of all group members, where each member row shows the member's name, avatar, and the number of recipes they have authored that are shared with this group.

#### Scenario: Member views settings page

- **WHEN** a group member navigates to `/groups/:id/settings`
- **THEN** the page displays the group's icon, name, and description as a read-only header section
- **THEN** the page displays a member list with each member's name, avatar, and recipe count
- **THEN** recipe counts are fetched from `GET /v1/groups/:id` which includes per-member recipe counts

#### Scenario: Non-member cannot access settings page

- **WHEN** a non-member authenticated user navigates to `/groups/:id/settings`
- **THEN** the page displays a 404 or access denied state (does not reveal group exists)

#### Scenario: Settings page skeleton loads while fetching

- **WHEN** a member navigates to `/groups/:id/settings`
- **THEN** a `<ContentSkeleton variant="card" />` is shown while the group query fetches
- **THEN** real content replaces the skeleton on successful load

### Requirement: Admin can kick members from the settings page

The system SHALL allow group admins to remove members from the settings page. Each member row (except the admin viewing the page) SHALL have a remove button triggered via an icon or menu action. On confirmation, the system SHALL call `DELETE /v1/groups/:id/members/:userId`. The member list SHALL refresh to reflect the removal. The group owner SHALL NOT be removable by kick.

#### Scenario: Admin kicks a member

- **WHEN** an admin clicks the remove action on a member row and confirms
- **THEN** the system calls `DELETE /v1/groups/:id/members/:userId`
- **THEN** on success, the member is removed from the displayed list
- **THEN** a success notification is shown

#### Scenario: Admin cannot kick the group owner

- **WHEN** the settings page renders the member list
- **THEN** the group owner row does NOT display a kick/remove action
- **THEN** even if an admin sends the API call, the server returns 400 `cannot_remove_owner`

#### Scenario: Non-admin does not see kick actions

- **WHEN** a non-admin member views the settings page
- **THEN** no kick/remove buttons are visible on any member row
- **THEN** the member list is displayed in read-only mode

### Requirement: Any member can quit (leave) a group from the settings page

The system SHALL allow any group member to leave a group via a "Leave Group" action on the settings page. On confirmation, the system SHALL call `POST /v1/groups/:id/quit`. On success, the user SHALL be redirected to `/groups`. The group owner SHALL NOT be able to quit unless they are the last and only member.

#### Scenario: Member quits a group

- **WHEN** a non-owner member clicks "Leave Group" and confirms the dialog
- **THEN** the system calls `POST /v1/groups/:id/quit`
- **THEN** on success, the user is redirected to `/groups`
- **THEN** the group no longer appears in the user's groups list

#### Scenario: Owner quits when last member

- **WHEN** the group owner is the only remaining member and clicks "Leave Group"
- **THEN** the system accepts the quit request
- **THEN** the group is deleted (empty group has no members)

#### Scenario: Owner cannot quit when other members exist

- **WHEN** the group owner tries to quit but other members remain in the group
- **THEN** the system returns a 400 error with `{ error: 'owner_must_transfer_or_delete' }`
- **THEN** the UI displays the error message

#### Scenario: Quit confirmation dialog

- **WHEN** any member clicks "Leave Group"
- **THEN** a confirmation dialog appears with the leave group warning message
- **THEN** the member must confirm before the quit API call is made

### Requirement: Admin can navigate to edit page from settings

The system SHALL provide a navigation action on the settings page that directs the admin to the group edit page (`/groups/:id/edit`). The edit action SHALL be visible only to admins. Non-admins SHALL not see the edit navigation.

#### Scenario: Admin navigates to edit from settings

- **WHEN** an admin clicks the edit action on the settings page
- **THEN** the user is navigated to `/groups/:id/edit`

#### Scenario: Non-admin does not see edit action

- **WHEN** a non-admin views the settings page
- **THEN** the edit navigation action is not visible

### Requirement: Admin can delete group from settings (last-member-only restriction)

The system SHALL provide a delete group action on the settings page visible only to admins. When triggered, a confirmation dialog SHALL appear. On confirmation, the system SHALL call `DELETE /v1/groups/:id`. The server SHALL enforce that the admin is the last and only member before allowing deletion. If other members still exist, the server SHALL return a 400 error. On success, the user SHALL be redirected to `/groups`.

#### Scenario: Admin deletes group as last member

- **WHEN** the admin is the only remaining member, clicks delete, and confirms
- **THEN** the system calls `DELETE /v1/groups/:id`
- **THEN** on 204 response, the user is redirected to `/groups`

#### Scenario: Admin cannot delete group with other members

- **WHEN** the admin clicks delete but other members still exist in the group
- **THEN** the server returns a 400 error with `{ error: 'group_has_other_members' }`
- **THEN** the UI displays the error message

#### Scenario: Non-admin does not see delete action

- **WHEN** a non-admin views the settings page
- **THEN** the delete group action is not visible

### Requirement: Settings page is i18n-aware

All static text on the settings page SHALL use i18n translation keys. Translation keys SHALL be added for: page title, member list header, recipe count label, kick member action/label, leave group action/label, leave confirmation message, edit group action, delete group action, delete confirmation message, and all error/success notifications.

#### Scenario: Settings page text translates correctly

- **WHEN** the user's language is set to a non-English locale
- **THEN** all settings page labels, buttons, and messages appear in that language
