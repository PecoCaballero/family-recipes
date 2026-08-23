## ADDED Requirements

### Requirement: Admin can add members via email search dialog

The system SHALL provide an "Add Member" button on the group settings page, visible only to admins. Clicking the button SHALL open a dialog (`AddMemberDialog`) with an email search input. As the admin types, the dialog SHALL call `GET /v1/users/search?email=<query>` and display matching users. Selecting a user SHALL call `POST /v1/groups/:id/members/:userId` to add them to the group. If the user is already a member, the API returns 200 idempotently. On success, the member list SHALL refresh.

#### Scenario: Admin searches and adds a user by email

- **WHEN** an admin opens the AddMemberDialog, types "alice@", and selects a matching user
- **THEN** the dialog calls `POST /v1/groups/:id/members/:userId`
- **THEN** on success, the dialog closes and the member list refreshes

#### Scenario: No users found for email query

- **WHEN** an admin types an email query that matches no users
- **THEN** the dialog displays an empty state message (i18n key)

#### Scenario: Non-admin does not see add member button

- **WHEN** a non-admin member views the settings page
- **THEN** the "Add Member" button is not visible

### Requirement: Admin can promote members to admin from settings page

The system SHALL provide a promote button (crown icon) on each non-admin member row in the settings page member list, visible only to admins. Clicking the promote button SHALL call `POST /v1/groups/:id/admins` with the member's `userId`. On success, the member list SHALL refresh to reflect the new admin status.

#### Scenario: Admin promotes a non-admin member

- **WHEN** an admin clicks the promote (crown) button on a non-admin member row
- **THEN** the system calls `POST /v1/groups/:id/admins` with `{ userId: member.id }`
- **THEN** on success, the promote button is replaced with a demote button and the member appears in the admin list

#### Scenario: Non-admin does not see promote buttons

- **WHEN** a non-admin member views the settings page
- **THEN** promote buttons are not visible

### Requirement: Admin can demote admin from settings page

The system SHALL provide a demote button (remove-crown icon) on each admin member row in the settings page member list, visible only to admins. The demote button SHALL NOT appear on the viewing admin themselves. Clicking the demote button SHALL call `DELETE /v1/groups/:id/admins/:userId`. On success, the member list SHALL refresh. If the target is the sole admin with other members, the API SHALL return a 400 error.

#### Scenario: Admin demotes another admin

- **WHEN** an admin clicks the demote button on another admin (not the sole admin)
- **THEN** the system calls `DELETE /v1/groups/:id/admins/:userId`
- **THEN** on success, the demote button is replaced with a promote button

#### Scenario: Cannot demote sole admin with other members

- **WHEN** an admin attempts to demote the only other admin in a group with members
- **THEN** the system returns a 400 error with `{ error: 'cannot_remove_sole_admin' }`
- **THEN** the UI displays the error message

#### Scenario: Non-admin does not see demote buttons

- **WHEN** a non-admin member views the settings page
- **THEN** demote buttons are not visible
