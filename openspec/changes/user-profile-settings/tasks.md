## 1. Shared Types & Validation

- [ ] 1.1 Add `updateProfileSchema` (name optional, email optional, at least one required) to `libs/shared/src/index.ts`
- [ ] 1.2 Add `changePasswordSchema` (currentPassword + newPassword, min 6 chars each) to `libs/shared/src/index.ts`
- [ ] 1.3 Export `UpdateProfileInput`, `ChangePasswordInput` types

## 2. API — Storage Provider (apps/api)

- [ ] 2.1 Install `multer` and `@types/multer` dev dependency
- [ ] 2.2 Create `apps/api/src/lib/storage.ts` with `StorageProvider` interface (`save`, `delete` methods) and `LocalStorageProvider` class (writes to `uploads/avatars/`, deletes by extracting filename from URL)
- [ ] 2.3 Create `apps/api/src/lib/avatarUpload.ts` — multer middleware configured for memory storage, 5 MB limit, image/* filter, single file field `avatar`

## 3. API — Profile Update Endpoint (apps/api)

- [ ] 3.1 Add `PATCH /me` to `apps/api/src/routes/users.ts` — validate input with `updateProfileSchema`, check email uniqueness if email changed, update name/email via prisma, return updated user
- [ ] 3.2 Ensure `publishDate` not used — only `updatedAt` auto-updated

## 4. API — Password Change Endpoint (apps/api)

- [ ] 4.1 Add `POST /me/password` to `apps/api/src/routes/users.ts` — validate input with `changePasswordSchema`, verify current password with bcrypt.compare, hash new password with bcrypt (cost 12), update via prisma

## 5. API — Avatar Endpoints (apps/api)

- [ ] 5.1 Add `POST /me/avatar` to `apps/api/src/routes/users.ts` — use multer middleware, save file via `LocalStorageProvider.save()`, update user `avatar` field, return `{ avatarUrl }`. If user already has avatar, delete old file first.
- [ ] 5.2 Add `DELETE /me/avatar` to `apps/api/src/routes/users.ts` — delete file via `LocalStorageProvider.delete()`, set avatar to null, return `{ avatarUrl: null }`
- [ ] 5.3 Add `express.static` middleware in `apps/api/src/main.ts` to serve `uploads/avatars/` at `/uploads/avatars/` path

## 6. API — Account Deletion Endpoint (apps/api)

- [ ] 6.1 Add owner guard to `DELETE /me` — query `Group` where `ownerId = userId`. If any rows exist, return 409 `{ error: 'group_owner', groups: [...] }`.
- [ ] 6.2 Add cascade delete to `DELETE /me` — wrap in prisma `$transaction`, cascade: RefreshToken → SavedRecipe → GroupMember → RecipeGroups + Ingredients + Recipes (author) → Groups (owner) → User. Delete avatar file. Return `{ status: 'deleted' }`.

## 7. Frontend — Avatar Upload UI (apps/web)

- [ ] 7.1 Create `apps/web/src/app/_components/AvatarUpload.tsx` — clickable avatar with hidden `<input type="file" accept="image/*">`, preview via `URL.createObjectURL`, upload button, loading state. Shows current avatar or initial-letter fallback.
- [ ] 7.2 Create React Query mutation hook `useAvatarUpload` in `apps/web/src/app/_hooks/user.ts` — `POST /v1/users/me/avatar` with FormData
- [ ] 7.3 Create React Query mutation hook `useAvatarRemove` in `apps/web/src/app/_hooks/user.ts` — `DELETE /v1/users/me/avatar`
- [ ] 7.4 Wire `AvatarUpload` into `AccountScene`, replacing static `UserInfo` avatar display
- [ ] 7.5 Update `AuthContext` user state on avatar change so UI reflects immediately

## 8. Frontend — Profile Edit UI (apps/web)

- [ ] 8.1 Create `apps/web/src/app/_components/EditProfileDialog.tsx` — MUI Dialog with name + email TextFields, save/cancel buttons, validation feedback, loading state
- [ ] 8.2 Create React Query mutation hook `useProfileUpdate` in `apps/web/src/app/_hooks/user.ts` — `PATCH /v1/users/me`
- [ ] 8.3 Add "Edit Profile" button to `AccountScene` that opens `EditProfileDialog`
- [ ] 8.4 Update `AuthContext` user state after successful profile update

## 9. Frontend — Password Change UI (apps/web)

- [ ] 9.1 Create `apps/web/src/app/_components/ChangePasswordDialog.tsx` — MUI Dialog with current password + new password + confirm new password fields, save/cancel, validation, loading state
- [ ] 9.2 Create React Query mutation hook `usePasswordChange` in `apps/web/src/app/_hooks/user.ts` — `POST /v1/users/me/password`
- [ ] 9.3 Add "Change Password" setting row to `AccountScene` that opens `ChangePasswordDialog`

## 10. Frontend — Account Deletion UI (apps/web)

- [ ] 10.1 Create `apps/web/src/app/_components/DeleteAccountDialog.tsx` — MUI Dialog with warning text, email confirmation field, delete button disabled until email matches, loading state
- [ ] 10.2 Create React Query mutation hook `useAccountDeletion` in `apps/web/src/app/_hooks/user.ts` — `DELETE /v1/users/me`
- [ ] 10.3 After successful deletion, clear tokens from sessionStorage and redirect to `/login`
- [ ] 10.4 Add "Delete Account" button (error color) to `AccountScene`, below logout, opens `DeleteAccountDialog`

## 11. Verification

- [ ] 11.1 Test avatar upload flow: upload → replace → remove → verify file cleanup
- [ ] 11.2 Test profile update: change name, change email, duplicate email rejection
- [ ] 11.3 Test password change: correct current, incorrect current, short new password
- [ ] 11.4 Test account deletion: owner blocked → delete owned groups → delete account → verify cascade (no orphaned rows) → verify token rejected after deletion
- [ ] 11.5 Verify frontend UI renders correctly in light and dark themes
- [ ] 11.6 Verify i18n strings exist for new UI text (edit profile, change password, delete account, avatar upload labels)
