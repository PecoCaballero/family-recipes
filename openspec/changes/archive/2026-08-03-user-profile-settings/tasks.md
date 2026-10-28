## 1. Shared Types & Validation

- [x] 1.1 Add `updateProfileSchema` (name optional, email optional, at least one required) to `libs/shared/src/index.ts`
- [x] 1.2 Add `changePasswordSchema` (currentPassword + newPassword, min 6 chars each) to `libs/shared/src/index.ts`
- [x] 1.3 Export `UpdateProfileInput`, `ChangePasswordInput` types

## 2. API — Storage Provider (apps/api)

- [x] 2.1 Install `multer` and `@types/multer` dev dependency
- [x] 2.2 Create `apps/api/src/lib/storage.ts` with `StorageProvider` interface (`save`, `delete` methods) and `LocalStorageProvider` class (writes to `uploads/avatars/`, deletes by extracting filename from URL)
- [x] 2.3 Create `apps/api/src/lib/avatarUpload.ts` — multer middleware configured for memory storage, 5 MB limit, image/* filter, single file field `avatar`

## 3. API — Profile Update Endpoint (apps/api)

- [x] 3.1 Add `PATCH /me` to `apps/api/src/routes/users.ts` — validate input with `updateProfileSchema`, check email uniqueness if email changed, update name/email via prisma, return updated user
- [x] 3.2 Ensure `publishDate` not used — only `updatedAt` auto-updated

## 4. API — Password Change Endpoint (apps/api)

- [x] 4.1 Add `POST /me/password` to `apps/api/src/routes/users.ts` — validate input with `changePasswordSchema`, verify current password with bcrypt.compare, hash new password with bcrypt (cost 12), update via prisma

## 5. API — Avatar Endpoints (apps/api)

- [x] 5.1 Add `POST /me/avatar` to `apps/api/src/routes/users.ts` — use multer middleware, save file via `LocalStorageProvider.save()`, update user `avatar` field, return `{ avatarUrl }`. If user already has avatar, delete old file first.
- [x] 5.2 Add `DELETE /me/avatar` to `apps/api/src/routes/users.ts` — delete file via `LocalStorageProvider.delete()`, set avatar to null, return `{ avatarUrl: null }`
- [x] 5.3 Add `express.static` middleware in `apps/api/src/main.ts` to serve `uploads/avatars/` at `/uploads/avatars/` path

## 6. API — Account Deletion Endpoint (apps/api)

- [x] 6.1 Add owner guard to `DELETE /me` — query `Group` where `ownerId = userId`. If any rows exist, return 409 `{ error: 'group_owner', groups: [...] }`.
- [x] 6.2 Add cascade delete to `DELETE /me` — wrap in prisma `$transaction`, cascade: RefreshToken → SavedRecipe → GroupMember → RecipeGroups + Ingredients + Recipes (author) → Groups (owner) → User. Delete avatar file. Return `{ status: 'deleted' }`.

## 7. Frontend — Avatar Upload UI (apps/web)

- [x] 7.1 Create `apps/web/src/app/_components/AvatarUpload.tsx` — clickable avatar with hidden `<input type="file" accept="image/*">`, preview via `URL.createObjectURL`, upload button, loading state. Shows current avatar or initial-letter fallback.
- [x] 7.2 Create React Query mutation hook `useAvatarUpload` in `apps/web/src/app/_hooks/user.ts` — `POST /v1/users/me/avatar` with FormData
- [x] 7.3 Create React Query mutation hook `useAvatarRemove` in `apps/web/src/app/_hooks/user.ts` — `DELETE /v1/users/me/avatar`
- [x] 7.4 Wire `AvatarUpload` into `AccountScene`, replacing static `UserInfo` avatar display
- [x] 7.5 Update `AuthContext` user state on avatar change so UI reflects immediately

## 8. Frontend — Profile Edit UI (apps/web)

- [x] 8.1 Create `apps/web/src/app/_components/EditProfileDialog.tsx` — MUI Dialog with name + email TextFields, save/cancel buttons, validation feedback, loading state
- [x] 8.2 Create React Query mutation hook `useProfileUpdate` in `apps/web/src/app/_hooks/user.ts` — `PATCH /v1/users/me`
- [x] 8.3 Add "Edit Profile" button to `AccountScene` that opens `EditProfileDialog`
- [x] 8.4 Update `AuthContext` user state after successful profile update

## 9. Frontend — Password Change UI (apps/web)

- [x] 9.1 Create `apps/web/src/app/_components/ChangePasswordDialog.tsx` — MUI Dialog with current password + new password + confirm new password fields, save/cancel, validation, loading state
- [x] 9.2 Create React Query mutation hook `usePasswordChange` in `apps/web/src/app/_hooks/user.ts` — `POST /v1/users/me/password`
- [x] 9.3 Add "Change Password" setting row to `AccountScene` that opens `ChangePasswordDialog`

## 10. Frontend — Account Deletion UI (apps/web)

- [x] 10.1 Create `apps/web/src/app/_components/DeleteAccountDialog.tsx` — MUI Dialog with warning text, email confirmation field, delete button disabled until email matches, loading state
- [x] 10.2 Create React Query mutation hook `useAccountDeletion` in `apps/web/src/app/_hooks/user.ts` — `DELETE /v1/users/me`
- [x] 10.3 After successful deletion, clear tokens from sessionStorage and redirect to `/login`
- [x] 10.4 Add "Delete Account" button (error color) to `AccountScene`, below logout, opens `DeleteAccountDialog`

## 11. Verification

- [x] 11.1 Test avatar upload flow: upload → replace → remove → verify file cleanup
- [x] 11.2 Test profile update: change name, change email, duplicate email rejection
- [x] 11.3 Test password change: correct current, incorrect current, short new password
- [x] 11.4 Test account deletion: owner blocked → delete owned groups → delete account → verify cascade (no orphaned rows) → verify token rejected after deletion
- [x] 11.5 Verify frontend UI renders correctly in light and dark themes
- [x] 11.6 Verify i18n strings exist for new UI text (edit profile, change password, delete account, avatar upload labels)
