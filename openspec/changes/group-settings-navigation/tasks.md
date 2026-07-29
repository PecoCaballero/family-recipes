## 1. Shared Types (libs/shared)

- [ ] 1.1 Add `MemberWithCount` type: `{ id, name, email, avatar, recipeCount }` zod schema in `libs/shared/src/index.ts`
- [ ] 1.2 Update `groupDetailResponseSchema` to include `members: z.array(memberWithCountSchema)` alongside existing `group`, `recipes`, `isAdmin`
- [ ] 1.3 Add `quitGroupResponseSchema`: `{ status: 'left', groupDeleted?: boolean }`

## 2. API — Quit Endpoint (apps/api)

- [ ] 2.1 Add `POST /v1/groups/:id/quit` route in `apps/api/src/routes/groups.ts`
- [ ] 2.2 Implement quit logic: verify membership, check if owner + last member → cascade delete group, otherwise delete GroupMember row
- [ ] 2.3 Return 400 if owner tries to quit with other members present (`owner_must_transfer_or_delete`)
- [ ] 2.4 Return 404 if user is not a member (do not leak group existence)
- [ ] 2.5 Register quit route in `apps/api/src/routes/index.ts` (if needed — already under groups router)

## 3. API — Enriched Group Detail (apps/api)

- [ ] 3.1 Modify `GET /v1/groups/:id` handler to query members via GroupMember join with User
- [ ] 3.2 Compute `recipeCount` per member: count Recipe rows by that author with RecipeGroup entry for this group
- [ ] 3.3 Return `members` array in response alongside existing `group`, `recipes`, `isAdmin`

## 4. API — Delete Restriction (apps/api)

- [ ] 4.1 Modify `DELETE /v1/groups/:id` to count remaining members before deletion
- [ ] 4.2 Return 400 `group_has_other_members` if GroupMember count > 1
- [ ] 4.3 Allow deletion if count === 1 (only owner remains) or count === 0 (orphaned group edge case)

## 5. Frontend — FloatingActionButton Component (apps/web)

- [ ] 5.1 Create `apps/web/src/app/_components/FloatingActionButton.tsx` with props: `icon`, `href`, `label`
- [ ] 5.2 Use MUI `<Fab>` with `color="primary"`, `position: fixed`, `bottom: 80px`, `right: 24px`, `zIndex: 1000`
- [ ] 5.3 Wrap in MUI `<Tooltip>` with `label` as title
- [ ] 5.4 Use Next.js `<Link>` or `router.push` for navigation
- [ ] 5.5 Add CSS module `FloatingActionButton.module.css` for positioning

## 6. Frontend — FAB Placement (apps/web)

- [ ] 6.1 Add `<FloatingActionButton icon={<Add />} href="/groups/create" label={t('groups.fabCreateTooltip')} />` to `apps/web/src/app/(root)/groups/page.tsx`
- [ ] 6.2 Add `<FloatingActionButton icon={<Add />} href="/recipes/create" label={t('recipes.fabCreateTooltip')} />` to `apps/web/src/app/(root)/recipes/page.tsx`
- [ ] 6.3 Add `Add` icon import from `@mui/icons-material` where needed
- [ ] 6.4 Import routes from `@/app/_utils/routes` and use `routes.groups.create.path` / `routes.recipes.create.path` instead of hardcoded strings

## 7. Frontend — Routes Utility (apps/web)

- [ ] 7.1 Add `settings` route to `routes.groups` in `apps/web/src/app/_utils/routes.ts`: `{ path: '/groups/:id/settings', title: 'Group Settings' }`
- [ ] 7.2 Audit all files modified in this change and replace hardcoded route strings with `routes.*.path` references (groups list, recipes list, group detail, settings page, FAB component)
- [ ] 7.3 Ensure all existing hardcoded route references in `groups/[id]/page.tsx` (e.g., `router.push('/groups')`, ``router.push(`/groups/${params.id}/edit`)``) are converted to use `routes.*` with path interpolation

## 8. Frontend — Group Detail Page Modification (apps/web)

- [ ] 8.1 Remove inline edit/delete buttons and confirmation dialog from `apps/web/src/app/(root)/groups/[id]/page.tsx`
- [ ] 8.2 Add settings button in header `endSlot` (Settings icon from `@mui/icons-material`) that navigates to `${routes.groups.settings.path}` (with `:id` replaced by actual group id)
- [ ] 8.3 Settings button visible to all group members (not just admin)
- [ ] 8.4 Import `Settings` icon and add to Header `endSlot` prop
- [ ] 8.5 Add `ChipFilter` component to the group detail page header, below the settings button row
- [ ] 8.6 Build `chipOptions` from the group's members list: one chip per member (label = member name, avatar = member avatar), plus an "All" chip at the start
- [ ] 8.7 Implement client-side filtering: when a member chip is selected, filter `recipes` to only those where `recipe.authorId === member.id`; when "All" is selected (or no chip), show all recipes
- [ ] 8.8 Add i18n key `groups.view.allRecipes` for the "All" chip label

## 9. Frontend — Group Settings Page (apps/web)

- [ ] 9.1 Create `apps/web/src/app/(root)/groups/[id]/settings/page.tsx` (new route)
- [ ] 9.2 Implement header with back navigation and title (`groups.settings.title`)
- [ ] 9.3 Render group summary section: icon, name, description (read-only)
- [ ] 9.4 Use `useGroupQuery(params.id)` to fetch group data including members
- [ ] 9.5 Render `<ContentSkeleton variant="card" />` while loading
- [ ] 9.6 Render member list: each row shows avatar, name, recipeCount
- [ ] 9.7 Admin-only: render kick button per member row (except self/owner), calls `useRemoveMember` mutation
- [ ] 9.8 Admin-only: render edit navigation button → `${routes.groups.edit.path}` (with `:id` replaced by actual group id)
- [ ] 9.9 Admin-only: render delete group button with confirmation dialog, calls `useDeleteGroup` mutation
- [ ] 9.10 All members: render "Leave Group" button with confirmation dialog, calls new `useQuitGroup` mutation
- [ ] 9.11 On quit/delete success: redirect to `${routes.groups.base.path}`

## 10. Frontend — React Query Hooks (apps/web)

- [ ] 10.1 Add `useQuitGroup(groupId)` mutation hook to `apps/web/src/app/_hooks/groups.ts`
- [ ] 10.2 Mutation calls `POST /v1/groups/${groupId}/quit`, invalidates groups list on success
- [ ] 10.3 Add `useRemoveMember(groupId)` mutation hook for kick (if not already present) — wraps existing `DELETE /v1/groups/:id/members/:userId`
- [ ] 10.4 Update `useGroupQuery` return type to include `members` array

## 11. i18n (apps/web)

- [ ] 11.1 Add new keys to `apps/web/src/app/_i18n/locales/en.json`:
  - `groups.settings.title`, `groups.settings.memberList`, `groups.settings.recipeCount`, `groups.settings.kickMember`, `groups.settings.leaveGroup`, `groups.settings.editGroup`, `groups.settings.deleteGroup`, `groups.settings.leaveConfirm`, `groups.settings.leaveConfirmMessage`, `groups.settings.deleteConfirm`, `groups.settings.deleteConfirmMessage`, `groups.settings.ownerCannotLeave`, `groups.settings.cannotDeleteWithMembers`
  - `groups.fabCreateTooltip`
  - `recipes.fabCreateTooltip`
  - `groups.view.allRecipes`
- [ ] 11.2 Add corresponding keys to other locale files (`es.json`, `fr.json`, `de.json`, `pt.json`) with translations

## 12. Verification

- [ ] 12.1 Verify `POST /v1/groups/:id/quit` works: member leaves, owner as last member deletes group, owner blocked when others present
- [ ] 12.2 Verify `GET /v1/groups/:id` returns `members` with correct `recipeCount`
- [ ] 12.3 Verify `DELETE /v1/groups/:id` returns 400 when other members exist
- [ ] 12.4 Verify settings page renders with skeleton, then group info, member list, and conditional admin actions
- [ ] 12.5 Verify FAB navigates correctly on groups and recipes list pages
- [ ] 12.6 Verify detail page shows settings button instead of edit/delete
- [ ] 12.7 Verify filter chips on group detail page filter recipes by member correctly, "All" shows all recipes
- [ ] 12.8 Verify all i18n keys render correctly (spot-check en + one other locale)
