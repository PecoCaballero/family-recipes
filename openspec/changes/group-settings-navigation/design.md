## Context

The group detail page currently shows recipes and inline edit/delete buttons for the owner. There is no dedicated space for group administration — viewing members, managing membership, or quitting. There is currently no way to navigate to create pages from the list pages; this change adds FABs for in-context shortcuts.

This change introduces a settings page as a peer route to the existing detail page, a reusable FAB component, and new API endpoints to support member self-service (quit) and enriched group detail data.

The tech stack is Next.js App Router, Express.js API, Prisma ORM with PostgreSQL, React Query, MUI components, CSS Modules, and i18n via translation files.

## Goals / Non-Goals

**Goals:**
- Dedicated settings page at `/groups/[id]/settings` for group administration
- Member list with per-member recipe counts
- Admin actions: kick member, navigate to edit, delete group (last-member-only)
- Member self-service: quit (leave) group
- FAB on groups list → `/groups/create` and recipes list → `/recipes/create`
- Server-enforced delete restriction (last member only)
- Full i18n coverage for all new UI text

**Non-Goals:**
- Changing group owner/adding co-owners (future Phase)
- Invite-by-email or invite links (future Phase)
- Real-time member updates (WebSocket/polling)
- FAB customization per page beyond icon/href/label
- Modifying the recipe detail page or user profile page
- Adding a FAB to any page other than groups list and recipes list

## Decisions

### Decision 1: Settings page as separate route (not dialog/modal)

**Choice**: New page at `/groups/[id]/settings` as a Next.js App Router route.

**Rationale**: The settings page has significant content — header summary, member list with recipe counts, multiple action buttons — that warrants a full page. This is consistent with the existing pattern (`/groups/[id]/edit` is also a separate route). A dialog would feel cramped and breaks mobile UX conventions for this much content.

**Alternatives considered**: Inline expansion on detail page (messy layout, mixes concerns), bottom sheet/drawer (awkward for lists with actions).

### Decision 2: FAB as reusable component with MUI Fab

**Choice**: `<FloatingActionButton icon, href, label />` component using MUI's `<Fab>` with `position: fixed; bottom: 80px; right: 24px`.

**Rationale**: MUI Fab provides built-in theme support, elevation, and accessibility. The 80px bottom offset accounts for the BottomNavigation bar height (~56px) plus 24px padding. The component is minimal — 3 props, no internal state — making it trivially reusable. Tooltip via MUI `<Tooltip>` wrapper.

**Alternatives considered**: Custom button with absolute positioning (reinventing MUI, more code), inlining FAB per page (duplication, no consistency).

### Decision 3: Member recipe counts computed server-side

**Choice**: Add `members` array to `GET /v1/groups/:id` response. Each member object has `{ id, name, email, avatar, recipeCount }`. Recipe count = `COUNT(Recipe.id)` where `Recipe.authorId = member.userId` AND `Recipe.id IN (SELECT recipeId FROM RecipeGroup WHERE groupId = :groupId)`.

**Rationale**: Computing on the server avoids N+1 client requests. Prisma can do this in a single query with `include` or a raw aggregation. The count is not a field that needs real-time accuracy (acceptable staleness between page loads).

**Alternatives considered**: Separate `/groups/:id/members` endpoint (extra round-trip), client-side counting (requires fetching all recipes, wasteful).

### Decision 4: Quit as `POST /v1/groups/:id/quit` (not DELETE /members)

**Choice**: New endpoint `POST /v1/groups/:id/quit`. The authenticated user's ID is extracted from the JWT, so the endpoint doesn't need a `:userId` parameter.

**Rationale**: Quit is a self-service action — the user leaves on their own behalf. `DELETE /v1/groups/:id/members/:userId` is an admin action (someone else removes a member). Mixing self-quit into the admin endpoint creates ambiguous authorization. A dedicated endpoint is explicit and clear. POST (not DELETE) follows convention for action endpoints on resources.

**Alternatives considered**: `DELETE /members/:userId` with self-check (confusing dual-purpose endpoint), `DELETE /groups/:id/members/self` (non-standard URL pattern).

### Decision 5: Delete restriction enforced server-side in transaction

**Choice**: The `DELETE /v1/groups/:id` handler checks `GroupMember.count({ where: { groupId } })` before deletion. If count > 1, return 400. If count === 1 and the member is the owner, proceed. Also handle the edge case where the group somehow has 0 members (delete anyway).

**Rationale**: Server-side enforcement is the only reliable guard. Client-side hiding of the delete button is a UX convenience, not security. The check runs in the same request, not a separate middleware.

**Alternatives considered**: Client-only check (bypassable via direct API call), separate "can-delete" endpoint (extra round-trip).

### Decision 6: Auth for settings page reuses useGroupQuery

**Choice**: The settings page uses the existing `useGroupQuery(id)` hook which returns `{ group, recipes, isAdmin, members }`. The `isAdmin` value from the server gates admin-only UI elements. If the user is not a member, the API returns 404.

**Rationale**: No new hook needed. The `useGroupQuery` response is extended to include `members` (with recipe counts) and the hook's return type is updated. This keeps the data fetching pattern consistent across detail and settings pages.

**Alternatives considered**: Separate `useGroupSettings` hook (over-engineering for one page), fetching members via a separate query (unnecessary request).

### Decision 7: i18n follows existing pattern — nested under `groups.settings` and `recipes`

**Choice**: New keys under `groups.settings.*` in each locale file. Reuse existing keys (`groups.leaveGroup`, `groups.deleteConfirm`, `groups.deleteConfirmMessage`, `groups.members`, etc.) where semantics match.

**Rationale**: Consistent with existing structure (`groups.create.*`, `groups.edit.*`). New FAB tooltips as `groups.fabCreateTooltip` and `recipes.fabCreateTooltip`.

### Decision 8: Filter chips on group detail page by member

**Choice**: Reuse the existing `<ChipFilter>` component on the group detail page. Build `chipOptions` from the group's members: one chip per member (label = member name, avatar = member avatar). Add an "All" chip as the first option. Client-side filter: when a member chip is selected, filter `recipes` to `recipe.authorId === member.id`.

**Rationale**: The `ChipFilter` component already exists and uses the same toggle-select pattern needed here. Client-side filtering is appropriate because all recipes for the group are already fetched via `useGroupQuery` — no additional API call needed. The member list comes from the same query response (Decision 3). Adding "All" as default ensures the initial view is unchanged.

**Alternatives considered**: Dropdown/select for member filter (more clicks, less visual), server-side filtering (extra API param, unnecessary complexity for a single-group recipe list).

### Decision 9: Route references use centralized routes.ts utility

**Choice**: All route strings in modified files SHALL reference `routes.*.path` from `apps/web/src/app/_utils/routes.ts` instead of hardcoded strings. A new `settings` entry added to `routes.groups`. Path parameters like `:id` replaced at usage site with string interpolation or `String.replace`.

**Rationale**: Single source of truth for routes prevents typos, makes refactoring safe, and matches the existing pattern already used in the codebase. Hardcoded route strings in the current `groups/[id]/page.tsx` are a known inconsistency that should be fixed.

**Alternatives considered**: Keep hardcoded strings (fragile, duplicates), generate routes from file system (over-engineering for this app size).

## Risks / Trade-offs

- **[Risk] Breaking change to group detail page**: Edit/delete buttons removed from detail page, moved to settings. Users expecting them on the old page may be briefly confused. → **Mitigation**: Settings button is prominent in the header; short learning curve.
- **[Risk] Member recipe counts may be stale**: Recipe counts reflect DB state at query time; if a member deletes a recipe after the page loads, the count is stale until refresh. → **Mitigation**: Acceptable — this is informational, not transactional.
- **[Risk] Owner quits and deletes group**: When owner quits as last member, group is cascade-deleted. Any shared recipes lose their group association. → **Mitigation**: Confirmation dialog warns user before quit/delete. This is intentional behavior.
- **[Trade-off] Quit endpoint adds route surface area**: Instead of 1 member-removal endpoint, there are now 2 (admin kick + self quit). → **Acceptable**: Clear separation of concerns outweighs route count.
