## Why

Currently groups have a single `ownerId` field — one owner per group. This creates friction: when the sole owner wants to leave or delete their account, the group must be deleted or ownership transferred manually. The `user-profile-settings` change blocks account deletion if the user owns any groups. Migrating to an admin array (`adminIds: string[]`) enables co-ownership, where any admin can manage the group and others can leave without stranding the group.

Blocked by: `user-profile-settings` account deletion guard (currently `group_owner` check; after this change, becomes `sole_admin` check).

## What Changes

- **BREAKING**: Replace `Group.ownerId` with `adminIds: string[]` in Prisma schema (new `GroupAdmin` junction table)
- **BREAKING**: All group API endpoints (`groups-crud`, `group-membership`, `group-settings`) replace `isOwner` checks with `isAdmin` checks
- Add `POST /v1/groups/:id/admins` (add admin) and `DELETE /v1/groups/:id/admins/:userId` (remove admin)
- Update `Group` type in `libs/shared` — replace `ownerId` with `adminIds`
- Migration script to convert existing `ownerId` → `adminIds: [ownerId]`
- Update `user-profile-settings` account deletion guard: "sole admin of any group" instead of "owner of any group"

## Capabilities

### Modified Capabilities
- `groups-crud`: Replace single owner with admin array in create/read/update/delete operations
- `group-membership`: Admin management (add/remove admin), permission checks use admin membership
- `group-settings`: Group settings modifiable by any admin, not just single owner

## Impact

- **apps/api**: New Prisma migration (add `GroupAdmin` table, drop `ownerId`), updated all group route handlers, new admin management routes
- **apps/web**: Updated group UI components to reflect admin array (member listing shows admins, admin-only controls)
- **libs/shared**: Updated `Group` type and schemas
- **Database**: Migration required — all existing groups get their current `ownerId` converted to an admin entry
