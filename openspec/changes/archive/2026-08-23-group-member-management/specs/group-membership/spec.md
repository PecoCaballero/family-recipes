## ADDED Requirements

### Requirement: Invited users can accept group invitations

The system SHALL allow an invited user to accept a pending invitation via `POST /v1/groups/:id/invitations/:invitationId/accept`. The authenticated user SHALL match the invitation's `inviteeUserId`. The invitation SHALL be in `pending` status and not expired. On acceptance, the system SHALL add the user as a group member and update the invitation status to `accepted`.

#### Scenario: User accepts a pending invitation

- **WHEN** the invited user sends `POST /v1/groups/:id/invitations/:invitationId/accept`
- **THEN** the system adds the user as a GroupMember
- **THEN** the system updates the invitation status to `accepted`
- **THEN** the system returns `{ status: 'accepted' }`

#### Scenario: Cannot accept an expired invitation

- **WHEN** a user attempts to accept an invitation past its `expiresAt` date
- **THEN** the system returns a 410 error with `{ error: 'invitation_expired' }`

#### Scenario: Cannot accept someone else's invitation

- **WHEN** an authenticated user attempts to accept an invitation where they are not the `inviteeUserId`
- **THEN** the system returns a 403 error

#### Scenario: Cannot accept an already-responded invitation

- **WHEN** a user attempts to accept an invitation with status `accepted` or `rejected`
- **THEN** the system returns a 409 error with `{ error: 'invitation_already_responded' }`

### Requirement: Admins can create invitations for non-members

The system SHALL allow group admins to create an invitation for a user via `POST /v1/groups/:id/invitations`. The body SHALL contain `{ inviteeUserId: string }`. The system SHALL create an Invitation row with a UUID token, status `pending`, and expiry of 7 days. If the user is already a member, return 409. If a pending invitation already exists, return the existing one (200, idempotent).

#### Scenario: Admin creates invitation for a non-member

- **WHEN** a group admin sends `POST /v1/groups/:id/invitations` with `{ inviteeUserId }`
- **THEN** the system creates an Invitation row with status `pending` and 7-day expiry
- **THEN** the system returns 201 with the invitation object

#### Scenario: Cannot invite an existing member

- **WHEN** an admin sends an invitation for a user who is already a group member
- **THEN** the system returns a 409 error with `{ error: 'user_already_member' }`

#### Scenario: Duplicate invitation is idempotent

- **WHEN** an admin sends an invitation for a user who already has a pending invitation to the same group
- **THEN** the system returns the existing invitation with 200 status

### Requirement: GET /v1/groups returns pending invitations for the authenticated user

The `GET /v1/groups` endpoint SHALL include a `pendingInvitations` array in the response. Each invitation object SHALL include `id`, `groupId`, `groupName`, `inviterName`, and `expiresAt`.

#### Scenario: User has pending invitations

- **WHEN** an authenticated user with pending invitations requests `GET /v1/groups`
- **THEN** the response includes `pendingInvitations: [{ id, groupId, groupName, inviterName, expiresAt }]`

#### Scenario: User has no pending invitations

- **WHEN** an authenticated user with no pending invitations requests `GET /v1/groups`
- **THEN** the response includes `pendingInvitations: []`
