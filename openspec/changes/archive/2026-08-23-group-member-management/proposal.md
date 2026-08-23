## Why

Backend already supports adding/kicking/promoting/demoting group members via REST endpoints, but the frontend has zero UI for adding members, promoting admins, or demoting them. Group admins must know raw user IDs — there's no email-based lookup or invitation flow. Additionally, sharing recipes to groups requires opening each recipe individually; there's no bulk flow from the group page. A seed script is also missing, making dev onboarding slow.

## What Changes

- **Add-member UI**: Dialog on group settings page to search users by email and add them to the group
- **Email-based invitation**: `POST /v1/groups/:id/invitations` creates an invitation; invitee accepts via `POST /v1/groups/:id/invitations/:invitationId/accept`. No external email — invites surface in-app.
- **Promote/demote UI**: Crown (promote) and remove-crown (demote) buttons in member list alongside existing kick button
- **Group detail FAB + bulk sharing**: FAB on group detail page opens dialog showing user's recipes not yet shared to that group; select one or more, confirm, batch-adds them to the group
- **Batch recipe endpoint**: `POST /v1/groups/:id/recipes/batch` accepts `{ recipeIds: string[] }`
- **Database seed**: Prisma seed script populating dev DB with sample users, recipes, groups, and memberships
- **New `Invitation` table**: Schema migration adding `Invitation` model (token, groupId, inviterId, inviteeEmail, status, expiresAt)

## Capabilities

### New Capabilities
- `email-invitation`: Search users by email, create/accept invitations, in-app invitation banner
- `bulk-recipe-share`: Batch endpoint + frontend dialog to select and share multiple unshared recipes to a group
- `database-seed`: Prisma seed script with sample users, recipes, groups, and memberships

### Modified Capabilities
- `group-settings`: Add promote-to-admin and demote-from-admin UI buttons; add "Add Member" email-search dialog
- `group-membership`: Add invitation endpoints (`POST .../invitations`, `POST .../invitations/:invitationId/accept`)
- `groups-crud`: Add `POST /v1/groups/:id/recipes/batch` bulk endpoint
- `groups-ui`: Add FAB on group detail page for bulk recipe sharing; email search dialog integration

## Impact

- **Backend** (`apps/api`): New invitation routes, batch recipe endpoint, Prisma schema update (Invitation table), seed script
- **Frontend** (`apps/web`): `AddMemberDialog`, `BulkShareDialog`, `InvitationBanner` components; updated group settings and detail pages
- **Shared** (`libs/shared`): Zod schemas for invitation create/accept and batch recipe inputs
- **Database**: New `Invitation` model + migration
