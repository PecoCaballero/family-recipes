## Why

The group detail page currently mixes content viewing (recipes) with admin actions (edit/delete buttons visible to owner). There is no way to manage group members — add, kick, quit — or see who contributes recipes. Users must navigate through the navbar to create groups/recipes; there is no in-page shortcut. This change adds a dedicated settings page for group administration and floating action buttons for quick creation.

## What Changes

- Add a **group settings page** at `/groups/[id]/settings` showing group icon, name, description, member list with per-member recipe counts
- Add **kick member** UI (admin only) on the settings page — calls existing `DELETE /v1/groups/:id/members/:userId`
- Add **quit group** UI (any member) on the settings page — calls new `POST /v1/groups/:id/quit` endpoint
- Move **edit** and **delete** buttons from the group detail page to the settings page
- Add **delete group** restriction: admin can only delete if they are the last and only member
- Add new API endpoint `POST /v1/groups/:id/quit` — any member can leave a group (owner cannot leave unless they are the last member)
- Add **recipe counts per member** to the `GET /v1/groups/:id` API response
- Add a reusable **FloatingActionButton** component
- Add FAB to **groups list page** (`/groups`) → navigates to `/groups/create`
- Add FAB to **recipes list page** (`/recipes`) → navigates to `/recipes/create`
- Add missing i18n keys for settings page, quit/kick actions, and FAB tooltips

## Capabilities

### New Capabilities

- `group-settings`: Settings page UI for group administration — icon/name/description display, member list with recipe counts, admin kick member, member quit group, edit navigation, restricted delete
- `fab-navigation`: Reusable FloatingActionButton component and placement on groups list and recipes list pages

### Modified Capabilities

- `groups-ui`: Edit/delete buttons moved from group detail page to settings page; FAB added to groups list page; settings page route and component added
- `group-membership`: New `POST /v1/groups/:id/quit` endpoint; `GET /v1/groups/:id` response enriched with per-member recipe counts; delete-group restricted to last-member-only for admin

## Impact

- **apps/web**: New `floatingActionButton` component, new settings page at `groups/[id]/settings/page.tsx`, modified `groups/[id]/page.tsx` (remove edit/delete buttons), modified `groups/page.tsx` (add FAB), modified `recipes/page.tsx` (add FAB), i18n keys added
- **apps/api**: New `POST /v1/groups/:id/quit` route, modified `GET /v1/groups/:id` response shape, modified `DELETE /v1/groups/:id` to enforce last-member-only constraint
- **libs/shared**: Add `quitGroupResponseSchema`, update `groupDetailResponseSchema` with member recipe counts
