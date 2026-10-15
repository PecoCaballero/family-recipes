## 1. Backend — remove demote endpoint (api)

- [x] 1.1 Remove the `DELETE /:id/admins/:userId` route from `apps/api/src/routes/groups.ts`

## 2. Frontend — hooks (web)

- [x] 2.1 Remove the `useRemoveAdmin` hook from `apps/web/src/app/_hooks/groups.ts`

## 3. Frontend — settings page (web)

- [x] 3.1 Remove the demote `IconButton` block, `handleDemote`, and the `useRemoveAdmin` import from `apps/web/src/app/(root)/groups/[id]/settings/page.tsx`
- [x] 3.2 Add an Admin `Chip` to admin member rows in the member list
- [x] 3.3 Wrap the promote `IconButton` in an MUI `Tooltip`
- [x] 3.4 Remove the now-unused `WorkspacePremiumOutlined` import

## 4. i18n (web)

- [x] 4.1 Add the `groups.adminBadge` key to `en.json`, `es.json`, `fr.json`, `de.json`, and `pt.json`
- [x] 4.2 Remove orphaned `demoteAdmin` and `cannotDemoteSoleAdmin` keys from all five locale files

## 5. Verification

- [x] 5.1 Run lint and typecheck for the affected apps
- [x] 5.2 Manually verify: promote shows a tooltip and the promoted member gains an Admin badge with no demote button; `DELETE /v1/groups/:id/admins/:userId` returns 404
