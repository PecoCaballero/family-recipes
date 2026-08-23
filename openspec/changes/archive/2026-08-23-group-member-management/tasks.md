## 1. Database — Invitation model & migration

- [x] 1.1 Add `Invitation` model to Prisma schema: id (UUID PK), token (UUID, unique, indexed), groupId (FK Group), inviterId (FK User), inviteeUserId (FK User), status (enum: pending/accepted/rejected/expired), expiresAt, createdAt, updatedAt. Cascade delete on Group.
- [x] 1.2 Add `InvitationStatus` enum to Prisma schema
- [x] 1.3 Run `prisma migrate dev` to generate migration
- [x] 1.4 Run `prisma generate` to update typed client

## 2. Shared — Zod schemas & types

- [x] 2.1 Add `batchAddRecipesSchema` in `libs/shared/src/index.ts`: `{ recipeIds: z.array(z.string().uuid()).min(1).max(50) }`
- [x] 2.2 Add `createInvitationSchema`: `{ inviteeUserId: z.string().uuid() }`
- [x] 2.3 Add `userSearchQuerySchema`: `{ email: z.string().min(1) }`
- [x] 2.4 Add TypeScript types: `BatchAddRecipesInput`, `CreateInvitationInput`, `InvitationResponse`, `PendingInvitation` with status union type

## 3. Backend — User search endpoint

- [x] 3.1 Add `GET /v1/users/search` route in `apps/api/src/routes/users.ts` (or new `routes/invitations.ts`): accept `?email=` query, validate with `userSearchQuerySchema`, call `prisma.user.findMany({ where: { email: { contains: query, mode: 'insensitive' } }, select: { id, name, email, avatar }, take: 10 })`
- [x] 3.2 Register route in `apps/api/src/routes/index.ts`

## 4. Backend — Invitation endpoints

- [x] 4.1 Create `apps/api/src/routes/invitations.ts` with invitation routes mounted under `/v1/groups/:id/invitations`
- [x] 4.2 `POST /v1/groups/:id/invitations`: validate body with `createInvitationSchema`, check req.userId is group admin (403 if not), check inviteeUserId not already member (409 if yes), check for existing pending invitation (return it if exists), create Invitation row with UUID token + 7-day expiry, return 201
- [x] 4.3 `POST /v1/groups/:id/invitations/:invitationId/accept`: find invitation by id+groupId, verify req.userId matches inviteeUserId (403 if not), check status is pending (409 if already responded), check not expired (410 if expired), add GroupMember row, update invitation status to accepted, return 200
- [x] 4.4 Register invitation routes in `apps/api/src/routes/index.ts` under `/v1/groups/:id/invitations`

## 5. Backend — Pending invitations in GET /v1/groups

- [x] 5.1 Modify `GET /v1/groups` handler: also query Invitation table for pending invitations where inviteeUserId = req.userId and status = 'pending' and expiresAt > now, include group name and inviter name via Prisma include
- [x] 5.2 Return `pendingInvitations` array in response: `[{ id, groupId, groupName, inviterName, expiresAt }]`

## 6. Backend — Batch recipe endpoint

- [x] 6.1 Add `POST /v1/groups/:id/recipes/batch` route in `apps/api/src/routes/groups.ts`: validate body with `batchAddRecipesSchema`, check req.userId is group admin (403 if not), use Prisma `$transaction` to upsert all RecipeGroup rows, distinguish newly-added vs already-existing, return `{ added: string[], skipped: string[] }`
- [x] 6.2 Register batch route in `apps/api/src/routes/index.ts`

## 7. Frontend — React Query hooks

- [x] 7.1 Add `useAddAdmin(groupId)` hook in `apps/web/src/app/_hooks/groups.ts`: calls `POST /v1/groups/:id/admins` with `{ userId }`, invalidates group detail on success
- [x] 7.2 Add `useRemoveAdmin(groupId)` hook: calls `DELETE /v1/groups/:id/admins/:userId`, invalidates group detail on success
- [x] 7.3 Add `useBatchAddRecipes(groupId)` hook: calls `POST /v1/groups/:id/recipes/batch` with `{ recipeIds }`, invalidates group detail on success
- [x] 7.4 Add `useCreateInvitation(groupId)` hook: calls `POST /v1/groups/:id/invitations` with `{ inviteeUserId }`
- [x] 7.5 Add `useAcceptInvitation(groupId)` hook: calls `POST /v1/groups/:id/invitations/:invitationId/accept`
- [x] 7.6 Add `useSearchUsers(email)` query hook: calls `GET /v1/users/search?email=` with debounce

## 8. Frontend — AddMemberDialog component

- [x] 8.1 Create `apps/web/src/app/_components/AddMemberDialog.tsx`: MUI Dialog with TextField for email input, debounced search using `useSearchUsers`, results list with user avatar+name+email, select triggers `POST /v1/groups/:id/members/:userId` via existing `useAddMember` or direct mutation
- [x] 8.2 Handle loading/empty/error states for search results
- [x] 8.3 Close dialog on successful add, refresh member list

## 9. Frontend — Group settings page updates (promote/demote)

- [x] 9.1 Add promote button (crown icon) to each non-admin member row in `apps/web/src/app/(root)/groups/[id]/settings/page.tsx`, visible only to admins
- [x] 9.2 Add demote button (remove-crown icon) to each admin member row (except viewing admin themselves), visible only to admins
- [x] 9.3 Wire promote button to `useAddAdmin` mutation, demote to `useRemoveAdmin`
- [x] 9.4 Add "Add Member" button in settings header, opens `AddMemberDialog`

## 10. Frontend — BulkShareDialog component

- [x] 10.1 Create `apps/web/src/app/_components/BulkShareDialog.tsx`: MUI Dialog, fetches user recipes via `useRecipesQuery` and group detail via `useGroupQuery`
- [x] 10.2 Filter out recipes whose IDs are in `group.recipeIds`
- [x] 10.3 Display unshared recipes as cards with checkboxes (selectable list)
- [x] 10.4 Confirm button calls `useBatchAddRecipes` with selected IDs
- [x] 10.5 Handle loading state during submission, success (close), error (show message)
- [x] 10.6 Show empty state when all recipes already shared

## 11. Frontend — Group detail page FAB

- [x] 11.1 Add `<FloatingActionButton />` to group detail page (`/groups/[id]/page.tsx`) with share icon, `href` removed (use onClick to open dialog), `label` i18n key `groups.fabShareTooltip`
- [x] 11.2 Wire FAB onClick to open `BulkShareDialog`
- [x] 11.3 FAB visible only to group members (guarded by existing useGroupQuery 404 behavior)

## 12. Frontend — Invitation banner on groups list

- [x] 12.1 Modify `GET /v1/groups` response handler in `useGroupsQuery` to extract `pendingInvitations`
- [x] 12.2 Create `InvitationBanner` component: MUI Alert or Card for each pending invitation showing group name, inviter name, "Accept" button
- [x] 12.3 Wire "Accept" button to `useAcceptInvitation` mutation, refresh groups list on success
- [x] 12.4 Render `InvitationBanner` at top of groups list page (`/groups/page.tsx`)

## 13. i18n — Translation keys

- [x] 13.1 Add translation keys to `apps/web/src/app/_i18n/locales/en.json`: groups.addMember, groups.addMemberTitle, groups.emailSearchPlaceholder, groups.noUsersFound, groups.promoteAdmin, groups.demoteAdmin, groups.fabShareTooltip, groups.bulkShareTitle, groups.bulkShareConfirm, groups.bulkShareEmpty, groups.invitationBanner, groups.invitationAccept, groups.invitationPendingCount, groups.cannotDemoteSoleAdmin
- [x] 13.2 Add same keys to es.json, fr.json, de.json, pt.json (with appropriate translations)

## 14. Database seed script

- [x] 14.1 Create `apps/api/prisma/seed.ts`: import Prisma client + bcrypt, define 5 users with hashed passwords, 15 recipes with ingredients, 3 groups with mixed memberships
- [x] 14.2 Implement idempotency: check existing users by email, skip if exists; use upsert for group memberships
- [x] 14.3 Add `prisma.seed` field to `apps/api/package.json`: `"prisma": { "seed": "tsx prisma/seed.ts" }`
- [x] 14.4 Add `seed` script to `apps/api/package.json`: `"seed": "npx prisma db seed"`
- [x] 14.5 Add Nx target `seed` in `apps/api/project.json` (or use existing `serve` target pattern)

## 15. Integration & verification

- [x] 15.1 Run seed script, verify data in DB
- [x] 15.2 Manually test: login as admin, add member via email search
- [x] 15.3 Manually test: promote member to admin, demote admin
- [x] 15.4 Manually test: create invitation, login as invitee, accept invitation from banner
- [x] 15.5 Manually test: FAB on group detail → BulkShareDialog → select recipes → share
- [x] 15.6 Manually test: batch endpoint with idempotency (share already-shared recipe)
- [x] 15.7 Verify all i18n keys display correctly in at least 2 languages
