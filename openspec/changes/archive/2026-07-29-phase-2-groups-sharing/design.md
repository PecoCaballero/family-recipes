## Context

Phase 1 built the database schema (including Group, GroupMember, RecipeGroup tables) and scaffolded basic group CRUD routes without authorization checks. The frontend has group list and detail pages connected to the API, but the create/edit pages are empty stubs and the SendRecipeDrawer uses hardcoded mock data.

Phase 2 needs to: add missing endpoints (delete group, remove recipe from group, membership management), add ownership authorization to all group mutation routes, hydrate denormalized fields (`groupIds`, `recipeIds`) that are currently always empty arrays, and build out the frontend group UI.

The existing API route structure and response shapes are preserved where possible. The shared `Group` type already has `recipeIds: z.array(z.string())` — it just needs to be populated from the DB instead of always being `[]`.

## Goals / Non-Goals

**Goals:**

- Add `DELETE /v1/groups/:id` with owner-only authorization
- Add `POST /v1/groups/:id/remove-recipe` endpoint
- Add membership endpoints: add member, remove member
- Add ownership checks to PATCH group and add-recipe-to-group routes
- Hydrate `groupIds` in recipe responses from RecipeGroup join table
- Hydrate `recipeIds` in group responses
- Implement recipe visibility gating by group membership (list recipe endpoint)
- Build Create Group and Edit Group pages with forms
- Wire SendRecipeDrawer to live API data
- Add React Query mutation hooks for all group operations
- Add i18n keys for new form fields and messages

**Non-Goals:**

- Group invitation system (email invites, invite codes) — deferred
- Group role/permission system (beyond owner/non-owner binary) — deferred
- Real-time updates (WebSocket/polling for group changes) — deferred
- Bulk member operations — deferred
- Group avatar image upload (icon is a string URL/emoji, not file upload) — deferred
- Frontend auth page redesign — keep existing UI

## Decisions

### Decision 1: Ownership check on every group mutation

**Choice:** Add `if (group.ownerId !== req.userId) return 403` guard to `PATCH /groups/:id`, `DELETE /groups/:id`, `POST /groups/:id/recipes`, `POST /groups/:id/remove-recipe`, `POST /groups/:id/members/:userId`, and `DELETE /groups/:id/members/:userId`.

**Rationale:** Consistent with existing recipe authorization pattern (`patch` and `delete` already check `authorId === req.userId`). Group owner has full mutation rights. Admin and co-owner roles with scoped permissions (e.g. manage members, add recipes) should be considered from the start — the authorization guard can check a role enum field on `GroupMember` rather than just binary owner check.

**Pattern:**
```typescript
const group = await prisma.group.findUnique({ where: { id: req.params.id } });
if (!group) return res.status(404).json({ error: 'group_not_found' });
if (group.ownerId !== req.userId) return res.status(403).json({ error: 'forbidden' });
```

### Decision 2: Membership-based visibility (not public groups)

**Choice:** `GET /v1/groups` returns only groups where the authenticated user has a `GroupMember` row. `GET /v1/groups/:id` returns 404 if the user is not a member.

**Rationale:** Groups are private by design in this family recipe app. No concept of "public groups" or "discoverable groups." The user must be explicitly added as a member to see group content. This simplifies authorization: group membership = group visibility.

**Alternatives considered:** Public/private group toggle (adds complexity, not in MVP scope), allow any authenticated user to see groups (defeats purpose of grouping).

### Decision 3: Hydrate denormalized arrays in format functions

**Choice:** Update `formatRecipe()` to query `RecipeGroup` and populate `groupIds`. Update `GET /v1/groups` and `GET /v1/groups/:id` to include `recipeIds` from `RecipeGroup`.

**Implementation:**
```typescript
// In formatRecipe():
const recipeGroups = await prisma.recipeGroup.findMany({
  where: { recipeId: dbRecipe.id },
  select: { groupId: true },
});
const groupIds = recipeGroups.map((rg) => rg.groupId);

// In GET /v1/groups: include recipes: { select: { recipeId: true } }
// Then map to recipeIds array
```

**Rationale:** These denormalized arrays already exist in the shared types and are part of the API contract. Phase 1 returned them as empty arrays. Hydrating them makes the API response complete without breaking the contract.

### Decision 4: Recipe list visibility expands to include group-shared recipes

**Choice:** `GET /v1/recipes` returns recipes where:
- `authorId === userId`, OR
- `visibility === 'public'`, OR
- The recipe has a `RecipeGroup` row where `groupId` is in the user's `GroupMember` set

**Implementation:** Query user's group memberships first, then include those group IDs in the recipe query:
```typescript
const userGroups = await prisma.groupMember.findMany({
  where: { userId: req.userId },
  select: { groupId: true },
});
const groupIds = userGroups.map((g) => g.groupId);

// Then in recipe where clause:
where: {
  OR: [
    { authorId: req.userId },
    { visibility: 'public' },
    ...(groupIds.length > 0 ? [{ recipeGroups: { some: { groupId: { in: groupIds } } } }] : []),
  ],
}
```

**Rationale:** This is the core value prop of Phase 2 — users share recipes in groups and members see them. The query adds one extra DB round-trip (fetching user's group IDs) but avoids complex subqueries.

### Decision 5: Frontend forms use MUI components with controlled state

**Choice:** Create Group and Edit Group pages use MUI `TextField` with React `useState` for form state. Submission calls the corresponding React Query mutation. Validation runs both client-side (required fields) and server-side (Zod schema).

**Rationale:** Consistent with existing app patterns (LoginScene, RegisterScene use MUI TextField + useState). Avoids adding Formik or React Hook Form dependency for simple 2-3 field forms.

**Pattern:**
```tsx
const [name, setName] = useState('');
const [description, setDescription] = useState('');
const [icon, setIcon] = useState('');
const createGroup = useCreateGroup();

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  createGroup.mutate({ name, description, icon: icon || undefined });
};
```

### Decision 6: SendRecipeDrawer fetches groups on open

**Choice:** When `open` transitions to `true`, call `useGroupsQuery()` to load current user's groups. Display loading state while fetching. On group tap, call `POST /v1/groups/:id/recipes` with the recipe ID.

**Rationale:** Live data is always fresh. No stale cache risk. The drawer is a transient component — remounting or re-fetching on open is acceptable UX. The group list is typically small (< 20 groups) so no pagination needed in drawer.

**Current state:** Drawer receives `recipe: Recipe` as prop and iterates `mockGroups`. Needs: add `useGroupsQuery()`, loading state, group tap handler with mutation call.

### Decision 7: React Query mutations with query invalidation

**Choice:** Each mutation hook uses `useMutation` + `queryClient.invalidateQueries` to refresh related data. Create/update/delete group invalidate `['groups']` query key. Add/remove recipe from group invalidate `['groups', id]`.

**Rationale:** Keeps UI consistent without manual state management. Invalidation is broader than necessary (could use `setQueryData` for optimistic updates) but simpler and more reliable for MVP. Optimistic updates can be added later if latency becomes an issue.

### Decision 8: No new dependencies

**Choice:** No new npm packages. All operations use existing stack: Prisma for DB, MUI for UI, React Query for server state, Zod for validation, i18next for translations.

**Rationale:** Zero dependency risk. All required capabilities already exist in the codebase.

## Risks / Trade-offs

- **[Risk] Group detail page returns full recipe objects with ingredients** → The `GET /v1/groups/:id` endpoint currently includes full recipe data. For groups with many recipes (50+), response size could be large. Mitigation: acceptable for MVP. Add pagination in future phase if needed.
- **[Risk] Recipe list query performance with group membership join** → The `GET /v1/recipes` visibility check requires two queries (user groups, then recipes). For users in many groups, the `IN` clause could grow large. Mitigation: acceptable for MVP (family groups are small). Add query optimization if group count exceeds practical limits.
- **[Trade-off] No remove-from-group endpoint on recipes route** → `POST /v1/recipes/:id/groups` adds to group but there is no corresponding remove. The remove endpoint lives on the group route (`POST /v1/groups/:id/remove-recipe`). This is asymmetric but acceptable: removing recipes from groups is a group-management action, not a recipe-editing action.
- **[Trade-off] Membership endpoints use userId in URL path** → `POST /v1/groups/:id/members/:userId` exposes user IDs. Acceptable since all routes are authenticated and user IDs are already exposed in recipe/group responses. No privacy leak beyond existing patterns.
- **[Risk] Frontend forms have no loading skeleton** → Resolved: every async-loading page/component (Create/Edit group, group detail, recipe list in drawer, member list) uses a reusable `<Skeleton />` component wrapper. Create a shared `ContentSkeleton` component supporting `variant` (card, form, list, table) and `count` props so all views use the same skeleton pattern. Skeleton renders immediately on mount while data is fetching, replaced by real content on success.

## Migration Plan

1. No database migration needed — all tables (Group, GroupMember, RecipeGroup) already exist from Phase 1
2. Backend changes are additive: new endpoints and authorization guards on existing endpoints
3. Frontend changes are additive: new form components and hook modifications
4. Rollback: revert commit. No data migration needed (existing group data is development-only)

## Open Questions

- Should the group owner appear in the member list UI? Decision: yes — owner is auto-added as member on group creation. The UI should display them and prevent removal.
- Should `GET /v1/recipes` include visibility rules enforced at the query level or post-query filter? Decision: query level (Prisma `where` clause) for efficiency.
- Should the `formatRecipe` `groupIds` query be batched or individual? Decision: individual per recipe for now (same pattern as `savedCount`). Batch if performance becomes an issue.
