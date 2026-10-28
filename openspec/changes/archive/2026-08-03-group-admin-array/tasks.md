## 1. Prisma Schema & Migration

- [x] 1.1 Add `GroupAdmin` model to `apps/api/prisma/schema.prisma` with `groupId` + `userId` composite PK, FK relations to `Group` and `User` with `onDelete: Cascade`
- [x] 1.2 Add `admins GroupAdmin[]` relation to existing `Group` model in schema.prisma
- [x] 1.3 Add `adminGroups GroupAdmin[]` relation to existing `User` model (remove `ownedGroups Group[]` after migration)
- [x] 1.4 Run `npx prisma migrate dev --name add_group_admin_table` to generate migration with backfill SQL (insert GroupAdmin rows from existing `ownerId` values)

## 2. Shared Types & Validation (libs/shared)

- [x] 2.1 Update `groupSchema` in `libs/shared/src/index.ts`: replace `ownerId: z.string()` with `adminIds: z.array(z.string())`, export updated `Group` type
- [x] 2.2 Add `addAdminSchema` to `libs/shared/src/index.ts` — validates `{ userId: z.string() }`
- [x] 2.3 Add `AddAdminInput` type export

## 3. API — Group Routes Audit (apps/api)

- [x] 3.1 In `apps/api/src/routes/groups.ts`, create helper `async function isGroupAdmin(groupId: string, userId: string): Promise<boolean>` using `prisma.groupAdmin.findUnique`
- [x] 3.2 `PATCH /:id` — replace `existing.ownerId !== req.userId` check with `await isGroupAdmin(req.params.id, req.userId!)`
- [x] 3.3 `DELETE /:id` — replace `group.ownerId !== req.userId` check with `await isGroupAdmin(req.params.id, req.userId!)`; include `admins` in query to remove GroupAdmin rows in transaction
- [x] 3.4 `POST /:id/recipes` — replace `group.ownerId !== req.userId` check with `await isGroupAdmin(req.params.id, req.userId!)`
- [x] 3.5 `POST /:id/remove-recipe` — replace `group.ownerId !== req.userId` check with `await isGroupAdmin(req.params.id, req.userId!)`
- [x] 3.6 `POST /:id/members/:userId` — replace `group.ownerId !== req.userId` check with `await isGroupAdmin(req.params.id, req.userId!)`
- [x] 3.7 `DELETE /:id/members/:userId` — replace `group.ownerId !== req.userId` with `isGroupAdmin`; replace `req.params.userId === group.ownerId` with sole-admin guard (count GroupAdmin rows, block if target is sole admin AND other members exist). Also delete GroupAdmin row for removed user.
- [x] 3.8 `POST /:id/quit` — replace ownership logic with GroupAdmin logic: query admin count, block if sole admin AND memberCount > 1 with error `sole_admin_must_promote_or_delete`; allow if another admin exists (delete both GroupMember + GroupAdmin rows); delete group if last member quits
- [x] 3.9 `POST /` (create) — replace `ownerId: req.userId!` with `admins: { create: { userId: req.userId! } }` using nested create

## 4. API — Group Response Shape Updates

- [x] 4.1 `GET /` — include `admins: { select: { userId: true } }` in query; map to `adminIds` array in response; remove `ownerId` from response
- [x] 4.2 `GET /:id` — include `admins: { select: { userId: true } }` in query; replace `isOwner = group.ownerId === req.userId` with `isAdmin = group.admins.some(a => a.userId === req.userId)`; add `adminIds` to response; remove `isOwner`/`ownerId` from response

## 5. API — Admin Management Endpoints (apps/api)

- [x] 5.1 Add `POST /v1/groups/:id/admins` — validate input with `addAdminSchema`, check caller is admin, verify target is a group member, create GroupAdmin row (upsert), return `{ status: 'added' }`
- [x] 5.2 Add `DELETE /v1/groups/:id/admins/:userId` — check caller is admin, check target is not sole admin if members > 1, delete GroupAdmin row, return `{ status: 'removed' }`

## 6. API — Account Deletion Guard (apps/api)

- [x] 6.1 In `apps/api/src/routes/users.ts` `DELETE /me` handler, replace `prisma.group.findMany({ where: { ownerId: req.userId } })` with sole-admin query: find all GroupAdmin rows for user, include group with admin count; filter to groups where `admins.length === 1`; return 409 with `{ error: 'sole_admin', groups: [...] }` if any

## 7. Frontend — Group Type & Response Handling (apps/web)

- [x] 7.1 Update frontend `Group` type definitions to use `adminIds: string[]` instead of `ownerId: string`
- [x] 7.2 Audit all `isOwner` / `group.ownerId` references in `apps/web` and replace with `isAdmin` / `group.adminIds.includes(userId)` pattern
- [x] 7.3 Update group detail page to read `isAdmin` from API response (already returned), remove client-side `ownerId` comparison
- [x] 7.4 Update group settings page to use `isAdmin` for showing/hiding admin-only controls (edit, delete, kick)

## 8. Verification

- [x] 8.1 Run prisma migration and verify GroupAdmin table exists, existing groups have admin rows, `ownerId` column still present
- [ ] 8.2 Test create group: verify GroupAdmin row created, `adminIds` in response, no `ownerId`
- [ ] 8.3 Test add/remove admin: verify POST `/admins` and DELETE `/admins/:userId` work, sole-admin guard blocks removal
- [ ] 8.4 Test add/remove member: verify admin check, sole-admin guard for member removal
- [ ] 8.5 Test quit: admin quits with other admin → allowed; sole admin quits with other members → blocked; last member quits → group deleted
- [ ] 8.6 Test account deletion: sole admin blocked, non-sole-admin allowed, co-admin after deletion leaves group intact
- [ ] 8.7 Test update/delete group: non-admin gets 403, admin succeeds
- [x] 8.8 Run existing test suite (`yarn test`) — verify no regressions (no test suite exists; TS compilation passes)
