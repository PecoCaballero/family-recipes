## ADDED Requirements

### Requirement: Admin members are identified by an Admin badge

The system SHALL display an "Admin" badge (Chip) next to the name of each member who is a group admin in the settings member list. The badge SHALL be visible to all members viewing the list, not only admins.

#### Scenario: Admin member shows badge

- **WHEN** a member views the settings member list and a listed member is a group admin
- **THEN** an "Admin" badge is displayed next to that member's name

#### Scenario: Non-admin member has no badge

- **WHEN** a member views the settings member list and a listed member is not a group admin
- **THEN** no Admin badge is displayed for that member

## MODIFIED Requirements

### Requirement: Admin can promote members to admin from settings page

The system SHALL provide a promote button (crown icon) on each non-admin member row in the settings page member list, visible only to admins. The promote button SHALL have a tooltip labeled "Promote to admin". Clicking the promote button SHALL call `POST /v1/groups/:id/admins` with the member's `userId`. On success, the member list SHALL refresh to reflect the new admin status.

#### Scenario: Admin promotes a non-admin member

- **WHEN** an admin clicks the promote (crown) button on a non-admin member row
- **THEN** the system calls `POST /v1/groups/:id/admins` with `{ userId: member.id }`
- **THEN** on success, the promote button is removed and an Admin badge appears next to the member's name

#### Scenario: Non-admin does not see promote buttons

- **WHEN** a non-admin member views the settings page
- **THEN** promote buttons are not visible

## REMOVED Requirements

### Requirement: Admin can demote admin from settings page

**Reason**: Demoting other admins is no longer permitted; the feature is being removed entirely.

**Migration**: No replacement. The backend `DELETE /v1/groups/:id/admins/:userId` endpoint is removed. Admins can still be removed from the group entirely by other admins via the kick endpoint (`DELETE /v1/groups/:id/members/:userId`), which also deletes their `GroupAdmin` row.
