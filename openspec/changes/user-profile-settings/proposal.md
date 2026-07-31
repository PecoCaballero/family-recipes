## Why

Users need to manage their identity and account lifecycle. Currently, the `User` model stores avatar and settings fields but there is no way to upload an avatar image, change display name or email, update password, or delete an account. The frontend `AccountScene` has a full settings UI (language, theme, privacy, notifications) wired to `PATCH /me/settings`, but the user info block shows a generic initial-letter avatar and a static name. Without account deletion, the app cannot comply with data privacy requirements or allow users to leave the platform.

## What Changes

- Add `PATCH /v1/users/me` endpoint for updating user profile fields (name, email)
- Add avatar upload: `POST /v1/users/me/avatar` accepts multipart image, saves to filesystem, updates `avatar` URL on User row, and serves avatars via static URL path
- Add password change: `POST /v1/users/me/password` validates current password and sets new bcrypt hash
- Add account deletion: `DELETE /v1/users/me` with cascade cleanup (refresh tokens, saved recipes, group memberships, owned groups, user's recipes, and the user row itself)
- Frontend: add avatar upload picker to `UserInfo` component, add name/email edit modal, add password change form, add account deletion with confirmation dialog
- Add `deleteAccount` mutation hook and wire to `AccountScene`
- **BREAKING**: none

## Capabilities

### New Capabilities
- `avatar-upload`: Avatar image upload via multipart form, filesystem storage, static file serving, and avatar URL persistence on the User record
- `account-deletion`: Authenticated user can delete their own account. All associated data (recipes, group memberships, saved recipes, refresh tokens, owned groups) is cascaded and deleted. Irreversible.
- `profile-management`: User can update their display name and email via API. Email changes validate uniqueness.

### Modified Capabilities
- `auth`: Add password change requirement — authenticated user provides current password + new password, system verifies current and updates hash

## Impact

- **apps/api**: New `multer` dependency for file upload handling. New `POST /me/avatar`, `DELETE /me` endpoints. Modified `PATCH /me` to accept name/email. New `POST /me/password` endpoint. Static file serving for `/uploads/avatars/`. Path validation and cleanup on avatar replace.
- **apps/web**: New avatar upload UI in `UserInfo` or `AccountScene`. New profile edit component (name, email). New password change form. New account deletion confirmation dialog. New React hooks for avatar upload, profile update, password change, account deletion.
- **libs/shared**: New schemas: `updateProfileSchema`, `changePasswordSchema`, `avatarUploadResponseSchema`. Extended `User` type already has `avatar` field — no change needed.
- **Infrastructure**: Avatars stored on local filesystem under `apps/api/uploads/avatars/`. Production would need a volume mount or swap to S3 — design should abstract storage behind an interface for future migration.
