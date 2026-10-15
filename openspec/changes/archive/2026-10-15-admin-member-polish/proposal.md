## Why

The group settings UI currently lets an admin demote another admin — an admin can strip another admin's role. The promote/demote icons (filled vs outlined crown) are visually ambiguous, and admin members have no on-screen indicator of their role.

## What Changes

- Remove demote entirely: remove the demote button from the settings member list, the `useRemoveAdmin` hook, and the backend `DELETE /v1/groups/:id/admins/:userId` endpoint (**BREAKING**). Kick is unchanged — admins can still be removed entirely from the group by other admins via `DELETE /v1/groups/:id/members/:userId`.
- Add an "Admin" badge (MUI `Chip`) to admin member rows in the settings member list.
- Add a tooltip to the promote button for clarity.
- Remove now-orphaned i18n keys (`demoteAdmin`, `cannotDemoteSoleAdmin`) and the unused `WorkspacePremiumOutlined` import.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `group-settings`: Remove the demote-admin requirement; add an Admin badge and a promote tooltip.
- `group-membership`: Remove the "remove another admin" requirement and its `DELETE /v1/groups/:id/admins/:userId` endpoint.

## Impact

- **Backend** (`apps/api`): remove `DELETE /v1/groups/:id/admins/:userId` route in `routes/groups.ts`.
- **Frontend** (`apps/web`): `groups/[id]/settings/page.tsx`, `_hooks/groups.ts`, i18n locale files.
- **Shared** (`libs/shared`): no change — `addAdminSchema` is retained for promote; no demote schema exists.
