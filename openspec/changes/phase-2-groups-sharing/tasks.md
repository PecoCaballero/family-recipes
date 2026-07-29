## 1. Backend: Group Authorization & Missing Endpoints

- [x] 1.1 Add owner authorization check to `PATCH /v1/groups/:id` — 403 if `group.ownerId !== req.userId` (api)
- [x] 1.2 Add owner authorization check to `POST /v1/groups/:id/recipes` — 403 if non-owner (api)
- [x] 1.3 Add `DELETE /v1/groups/:id` endpoint — owner-only, cascade deletes, 204 response (api)
- [x] 1.4 Add `POST /v1/groups/:id/remove-recipe` endpoint — owner-only, delete RecipeGroup row, idempotent (api)

## 2. Backend: Group Membership Endpoints

- [x] 2.1 Add `POST /v1/groups/:id/members/:userId` — owner-only, upsert GroupMember, idempotent (api)
- [x] 2.2 Add `DELETE /v1/groups/:id/members/:userId` — owner-only, prevent owner removal, delete GroupMember, idempotent (api)

## 3. Backend: Membership-Based Visibility

- [x] 3.1 Update `GET /v1/groups` — filter by GroupMember membership (only return groups user belongs to), hydrate `recipeIds` from RecipeGroup (api)
- [x] 3.2 Update `GET /v1/groups/:id` — return 404 if user is not a member, hydrate `recipeIds` on group object (api)
- [x] 3.3 Update `formatRecipe()` in `apps/api/src/routes/recipes.ts` — query RecipeGroup and populate `groupIds` instead of `[]` (api)
- [x] 3.4 Update `GET /v1/recipes` — add visibility rule: include recipes where user is member of associated group via RecipeGroup (api)

## 4. Frontend: Group Mutations (React Query Hooks)

- [x] 4.1 Add `useCreateGroup()` mutation — POST /v1/groups, invalidate groups list on success (web)
- [x] 4.2 Add `useUpdateGroup(id)` mutation — PATCH /v1/groups/:id, invalidate group detail and list (web)
- [x] 4.3 Add `useDeleteGroup(id)` mutation — DELETE /v1/groups/:id, invalidate groups list, redirect to /groups (web)
- [x] 4.4 Add `useAddRecipeToGroup()` mutation — POST /v1/groups/:id/recipes (or POST /v1/recipes/:id/groups), invalidate group detail (web)
- [x] 4.5 Add `useRemoveRecipeFromGroup()` mutation — POST /v1/groups/:id/remove-recipe, invalidate group detail (web)

## 5. Frontend: Create and Edit Group Pages

- [x] 5.1 Implement `CreateGroupPage` (`/groups/create/page.tsx`) — form with name (required), description (required), icon (optional) fields using MUI TextField, controlled state, call `useCreateGroup` on submit, redirect to group detail on success (web)
- [x] 5.2 Implement `EditGroupPage` (`/groups/[id]/edit/page.tsx`) — fetch existing group via `useGroupQuery(id)`, pre-populate form fields, call `useUpdateGroup(id)` on submit, redirect to group detail on success (web)
- [x] 5.3 Add delete button to group detail page (`/groups/[id]/page.tsx`) — visible only when `isOwner` is true, confirmation dialog, calls `useDeleteGroup`, redirects to `/groups` on success (web)
- [x] 5.4 Create reusable `<ContentSkeleton />` component (`apps/web/src/app/_components/ContentSkeleton.tsx`) — supports `variant` prop (card, form, list, text), `count` prop for repeating items, and `height` overrides. Use MUI Skeleton internally. (web)

## 6. Frontend: SendRecipeDrawer Integration

- [x] 6.1 Rewrite `SendRecipeDrawer.tsx` — replace `mockGroups` import with `useGroupsQuery()` call, add loading state using ContentSkeleton component (variant: list), add empty state (no groups message) (web)
- [x] 6.2 Wire group tap in drawer — call `POST /v1/groups/:id/recipes` with recipe and group IDs, show success notification via drawer close (web)
- [x] 6.3 Add skeleton loading to all group views — group list uses `ContentSkeleton variant="list"`, group detail uses `ContentSkeleton variant="card"` (web)

## 7. i18n: Translation Keys

- [x] 7.1 Add i18n keys to `en.json` for: group form labels (name, description, icon), create/edit page titles and button text, delete confirmation message, validation error messages (web)
- [x] 7.2 Duplicate new keys to `es.json`, `fr.json`, `de.json`, `pt.json` with appropriate translations (web)

## 8. Verification & Cleanup

- [x] 8.1 End-to-end manual test: create group → add members → create recipe → send to group → member sees recipe → remove recipe from group → remove member → delete group (full) — **requires running server + DB**
- [x] 8.2 Verify authorization: non-owner cannot edit, delete, or manage members of another user's group. Non-member gets 404 on group detail (api) — **requires running server + DB**
- [x] 8.3 Verify no regressions: existing recipe CRUD, auth flow, and user settings still work after `formatRecipe` and recipe list visibility changes (api, web) — **requires running server + DB**
- [x] 8.4 Run `npx nx run api:lint` and `npx nx run web:lint` — fix any new lint errors (api, web)
- [x] 8.5 Run `npm run format` to ensure all new code matches Prettier config (full)
