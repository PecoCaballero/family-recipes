## Purpose

TBD — Email-based user lookup and in-app group invitation flow (create, accept, list pending invitations).

## Requirements

### Requirement: Admins can search users by email

The system SHALL provide a `GET /v1/users/search?email=<query>` endpoint that
returns users whose email partially matches the query (case-insensitive). The
query SHALL be at least 3 characters; shorter queries SHALL return a 400 error
to limit email enumeration. The endpoint SHALL return at most 10 results. The
endpoint SHALL require authentication.

#### Scenario: Search by partial email

- **WHEN** an authenticated user sends `GET /v1/users/search?email=alice@`
- **THEN** the system returns users whose email contains "alice@" (case-insensitive)
- **THEN** the response format is `{ users: [{ id, name, email, avatar }] }`
- **THEN** at most 10 results are returned

#### Scenario: Query shorter than 3 characters rejected

- **WHEN** an authenticated user sends `GET /v1/users/search?email=a`
- **THEN** the system returns a 400 error with `{ error: 'validation_error' }`

#### Scenario: No matches found

- **WHEN** an authenticated user sends `GET /v1/users/search?email=nonexistent`
- **THEN** the system returns `{ users: [] }` with a 200 status

#### Scenario: Unauthenticated request denied

- **WHEN** an unauthenticated client sends `GET /v1/users/search?email=test`
- **THEN** the system returns a 401 error

### Requirement: Admins can create group invitations by email

The system SHALL allow group admins to invite a user to their group via
`POST /v1/groups/:id/invitations`. The request body SHALL contain
`{ inviteeUserId: string }`. The system SHALL verify the invitee exists and
SHALL return a 404 error if it does not, before creating any row. The system
SHALL create an `Invitation` row with a UUID token, status `pending`, and an
expiry of 7 days. If an active (pending, non-expired) invitation already exists
for the same group and user, the system SHALL return the existing invitation.
Non-admins SHALL receive a 403 error. If the user is already a member, the
system SHALL return a 409 error.

#### Scenario: Admin creates an invitation

- **WHEN** a group admin sends `POST /v1/groups/:id/invitations` with a valid `{ inviteeUserId }`
- **THEN** the system inserts an Invitation row with status `pending` and a 7-day expiry
- **THEN** the system returns a 201 response with `{ invitation: { id, groupId, inviterId, inviteeUserId, status, expiresAt } }`

#### Scenario: Invitee does not exist

- **WHEN** an admin sends an invitation for a `inviteeUserId` that does not
  correspond to any user
- **THEN** the system returns a 404 error and does not create an invitation

#### Scenario: Invitation for already-existing member

- **WHEN** an admin sends an invitation for a user who is already a group member
- **THEN** the system returns a 409 error with `{ error: 'user_already_member' }`

#### Scenario: Duplicate pending invitation is idempotent

- **WHEN** an admin sends an invitation for a user who already has a pending invitation to the same group
- **THEN** the system returns the existing invitation with a 200 status (no duplicate row)

#### Scenario: Non-admin cannot create invitations

- **WHEN** a non-admin authenticated user sends `POST /v1/groups/:id/invitations`
- **THEN** the system returns a 403 error

### Requirement: Invited users can accept invitations

The system SHALL allow an invited user to accept an invitation via `POST /v1/groups/:id/invitations/:invitationId/accept`. The authenticated user SHALL match the invitation's `inviteeUserId`. The invitation SHALL be in `pending` status and not expired. On acceptance, the system SHALL add the user as a group member and update the invitation status to `accepted`.

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

#### Scenario: Cannot accept an already-accepted invitation

- **WHEN** a user attempts to accept an invitation with status `accepted` or `rejected`
- **THEN** the system returns a 409 error with `{ error: 'invitation_already_responded' }`

### Requirement: Users can see their pending invitations

The system SHALL return pending invitations for the authenticated user as part of the groups list or a dedicated endpoint. The frontend SHALL display a banner on the groups list page when pending invitations exist.

#### Scenario: Groups list includes pending invitations

- **WHEN** an authenticated user with pending invitations requests `GET /v1/groups`
- **THEN** the response includes `{ groups: [...], pendingInvitations: [{ id, groupId, groupName, inviterName, expiresAt }] }`

#### Scenario: No pending invitations

- **WHEN** an authenticated user with no pending invitations requests `GET /v1/groups`
- **THEN** the response includes `{ groups: [...], pendingInvitations: [] }`

### Requirement: Invitation schema and migration

The system SHALL define an `Invitation` model in the Prisma schema with fields: `id` (UUID PK), `token` (UUID, unique, indexed), `groupId` (FK Group), `inviterId` (FK User), `inviteeUserId` (FK User), `status` (enum: pending/accepted/rejected/expired), `expiresAt` (DateTime), `createdAt` (DateTime), `updatedAt` (DateTime). The model SHALL cascade delete when the group is deleted.

#### Scenario: Prisma schema includes Invitation model

- **WHEN** Prisma migrate is run
- **THEN** the Invitation table is created with all required fields and foreign keys
