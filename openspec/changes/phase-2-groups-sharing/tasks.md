## 1. Backend: Group Authorization & Missing Endpoints

- [ ] 1.1 Add admin authorization check to `PATCH /v1/groups/:id` — 403 if user is not owner or co-owner (check role enum on GroupMember) (api)
- [ ] 1.2 Add membership check to `POST /v1/groups/:id/recipes` — 403 if user is not a group member (any member can send recipes) (api)
- [ ] 1.3 Add `DELETE /v1/groups/:id` endpoint — admin-only (owner/co-owner), cascade deletes, 204 response (api)
- [ ] 1.4 Add `POST /v1/groups/:id/remove-recipe` endpoint — any member can delete their own recipe; admins can delete any recipe. Delete RecipeGroup row, idempotent (api)

## 2. Backend: Group Membership Endpoints

- [ ] 2.1 Add `POST /v1/groups/:id/members/:userId` — admin-only (owner/co-owner), upsert GroupMember, idempotent (api)
- [ ] 2.2 Add `DELETE /v1/groups/:id/members/:userId` — admin-only, prevent owner removal, delete GroupMember, idempotent (api)

## 3. Backend: Membership-Based Visibility

- [ ] 3.1 Update `GET /v1/groups` — filter by GroupMember membership (only return groups user belongs to), hydrate `recipeIds` from RecipeGroup (api)
- [ ] 3.2 Update `GET /v1/groups/:id` — return 404 if user is not a member, hydrate `recipeIds` on group object (api)
- [ ] 3.3 Update `formatRecipe()` in `apps/api/src/routes/recipes.ts` — query RecipeGroup and populate `groupIds` instead of `[]` (api)
- [ ] 3.4 Update `GET /v1/recipes` — add visibility rule: include recipes where user is member of associated group via RecipeGroup (api)

## 4. Frontend: Group Mutations (React Query Hooks)

- [ ] 4.1 Add `useCreateGroup()` mutation — POST /v1/groups, invalidate groups list on success (web)
- [ ] 4.2 Add `useUpdateGroup(id)` mutation — PATCH /v1/groups/:id, invalidate group detail and list (web)
- [ ] 4.3 Add `useDeleteGroup(id)` mutation — DELETE /v1/groups/:id, invalidate groups list, redirect to /groups (web)
- [ ] 4.4 Add `useAddRecipeToGroup()` mutation — POST /v1/groups/:id/recipes (or POST /v1/recipes/:id/groups), invalidate group detail (web)
- [ ] 4.5 Add `useRemoveRecipeFromGroup()` mutation — POST /v1/groups/:id/remove-recipe, invalidate group detail (web)

## 5. Frontend: Create and Edit Group Pages

- [ ] 5.1 Implement `CreateGroupPage` (`/groups/create/page.tsx`) — form with name (required), description (required), icon (optional) fields using MUI TextField, controlled state, call `useCreateGroup` on submit, redirect to group detail on success (web)
- [ ] 5.2 Implement `EditGroupPage` (`/groups/[id]/edit/page.tsx`) — fetch existing group via `useGroupQuery(id)`, pre-populate form fields, call `useUpdateGroup(id)` on submit, redirect to group detail on success (web)
- [ ] 5.3 Add delete button to group detail page (`/groups/[id]/page.tsx`) — visible only when `isAdmin` is true (owner or co-owner), confirmation dialog, calls `useDeleteGroup`, redirects to `/groups` on success (web)
- [ ] 5.4 Create reusable `<ContentSkeleton />` component (`apps/web/src/components/ContentSkeleton.tsx`) — supports `variant` prop (card, form, list, table, text), `count` prop for repeating items, and `height`/`width` overrides. Use MUI Skeleton internally. All async-loading views use this instead of ad-hoc skeletons or blank loading states (web)

## 6. Frontend: SendRecipeDrawer Integration

- [ ] 6.1 Rewrite `SendRecipeDrawer.tsx` — replace `mockGroups` import with `useGroupsQuery()` call, add loading state using shared `ContentSkeleton` component (variant: list), add empty state (no groups message) (web)
- [ ] 6.2 Wire group tap in drawer — call `POST /v1/recipes/:id/groups` (or `POST /v1/groups/:id/recipes`) with recipe and group IDs, show success notification via snackbar or alert (web)
- [ ] 6.3 Add skeleton loading to all group views — group list (`/groups/page.tsx`) uses `ContentSkeleton variant="list"`, group detail (`/groups/[id]/page.tsx`) uses `ContentSkeleton variant="card"`, Create/Edit forms use `ContentSkeleton variant="form"`. Skeleton renders immediately on mount while data fetches (web)

## 7. i18n: Translation Keys

- [ ] 7.1 Add i18n keys to `en.json` for: group form labels (name, description, icon), create/edit page titles and button text, delete confirmation message, send-to-group success/empty/loading messages, validation error messages (web)
- [ ] 7.2 Duplicate new keys to `es.json`, `fr.json`, `de.json`, `pt.json` with appropriate translations (web)

## 8. Verification & Cleanup

- [ ] 8.1 End-to-end manual test: create group → add members → create recipe → send to group → member sees recipe → remove recipe from group → remove member → delete group (full)
- [ ] 8.2 Verify authorization: non-admin cannot edit, delete, or manage members of another user's group. Non-member gets 404 on group detail. Non-member cannot send recipes to the group (api)
- [ ] 8.3 Verify no regressions: existing recipe CRUD, auth flow, and user settings still work after `formatRecipe` and recipe list visibility changes (api, web)
- [ ] 8.4 Run `npx nx run api:lint` and `npx nx run web:lint` — fix any new lint errors (api, web)
- [ ] 8.5 Run `npm run format` to ensure all new code matches Prettier config (full)
