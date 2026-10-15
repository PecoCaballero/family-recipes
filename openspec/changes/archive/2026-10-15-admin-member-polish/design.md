## Context

The group settings page renders member rows with promote/demote/kick icon buttons. The backend groups router has `POST /:id/admins` (promote), `DELETE /:id/admins/:userId` (demote), and `DELETE /:id/members/:userId` (kick, which also removes the `GroupAdmin` row when removing a member). `MemberWithCount` has no `isAdmin` field; the frontend derives admin status via `group.adminIds`. `useAddAdmin`/`useRemoveAdmin` hooks already exist.

## Goals / Non-Goals

**Goals:**
- Forbid demoting other admins.
- Surface admin status clearly on member rows.
- Clarify the promote action.

**Non-Goals:**
- Self-demotion / step-down flow.
- Ownership transfer.
- Changing kick behavior.

## Decisions

### Decision 1: Remove demote entirely (UI + hook + endpoint)

**Chosen**: Delete the demote button, the `useRemoveAdmin` hook, and the `DELETE /v1/groups/:id/admins/:userId` route. Admins can no longer be *demoted* (admin role stripped while remaining a member).

**Note on scope**: This removes demotion only, NOT removal. Kicking is unchanged — an admin can still remove another admin entirely from the group via `DELETE /v1/groups/:id/members/:userId`, which deletes both the `GroupMember` and `GroupAdmin` rows. The UI already hides the kick button for admin rows, but the API still permits it, and that behavior is intentionally kept.

**Rationale**: Matches "an admin must not demote another admin" and the chosen "no demote at all" model. Demotion (role-stripping) is the target; full removal via kick is a separate, retained feature.

**Alternatives considered**:
- *Self-demote only*: adds a self-only path and leaves role-change semantics in place; out of scope and rejected.
- *Block kicking admins entirely*: rejected — the user confirmed kick removal of admins is acceptable.

### Decision 2: Admin badge via `Chip`

**Chosen**: When `member.id` is in `group.adminIds`, render a small MUI `Chip` labeled with the i18n key `groups.adminBadge` next to the member name.

**Rationale**: Clear and minimal; reuses MUI `Chip`; requires no API change since `adminIds` is already returned by `GET /v1/groups/:id`.

**Alternatives considered**:
- *Text suffix / icon-only*: less clear than an explicit badge. Rejected.

### Decision 3: Promote tooltip

**Chosen**: Wrap the promote `IconButton` in an MUI `Tooltip` with `groups.promoteAdmin`.

**Rationale**: Resolves the icon ambiguity; after removing demote, only one crown icon remains.

## Risks / Trade-offs

- **Removing `DELETE /:id/admins/:userId` is breaking** → Only the web client consumes it; acceptable.
- **Demotion removed, but removal remains** → Admins can still be kicked by other admins (full removal via `DELETE /:id/members/:userId`). This is intentional per product decision; documented in Decision 1.
- **Orphaned i18n key cleanup touches five locale files** → Cosmetic, low risk.
