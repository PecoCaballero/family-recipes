## Context

The backend already has `GET /v1/users/me`, `PATCH /v1/users/me/settings`, and `POST /v1/users/me/logout`. The `User` Prisma model includes `avatar` (`String?`) and settings columns. The frontend `AccountScene` renders settings UI and shows a generic initial-letter avatar via MUI `Avatar`. What's missing: avatar image upload/display, profile field editing (name/email), password change, and account deletion.

This design covers the backend endpoints and storage decisions to complete the user profile lifecycle.

## Goals / Non-Goals

**Goals:**
- Avatar upload endpoint accepting image files, persisting to disk, returning a URL
- Serve avatar images as static files from Express
- Profile update endpoint for name and email
- Password change endpoint with current-password verification
- Account deletion endpoint with full data cascade
- Frontend: avatar picker, name/email edit modal, password change form, delete account flow
- Storage abstraction so avatar backend can swap to S3 later without route changes

**Non-Goals:**
- OAuth avatar import (Google/Apple user photos)
- Email verification on email change
- Password reset via email
- Crop/resize/optimize uploaded images (accept as-is, limit file size)
- Production CDN for avatar serving (filesystem is dev-first; S3 swap planned for prod)

## Decisions

### Decision 1: Avatar storage — filesystem (dev) with storage interface

**Choice:** Store uploaded avatars in `apps/api/uploads/avatars/` directory. Serve via Express `express.static`. Wrap storage operations behind a `StorageProvider` interface so the implementation can be swapped to S3 without changing route handlers.

**Interface:**
```typescript
interface StorageProvider {
  save(filename: string, buffer: Buffer, mimetype: string): Promise<string>; // returns public URL
  delete(url: string): Promise<void>;
}
```

**Rationale:** Keeps local dev zero-config (no S3/MinIO). The interface prevents lock-in — swap one file to go from `LocalStorageProvider` to `S3StorageProvider`. S3 migration is out of scope for this change.

**Alternatives considered:** Base64-encoded avatars in DB (bloats DB, no caching), Cloudinary/S3 only (requires cloud credentials for local dev).

### Decision 2: multer for multipart file upload

**Choice:** Use `multer` npm package for parsing `multipart/form-data` on the avatar upload endpoint. Configure memory storage (no temp files) with a 5 MB file size limit and `image/*` MIME type filter.

**Rationale:** `multer` is the de-facto Express multipart middleware. Memory storage avoids disk temp files (image is immediately written to final location). The 5 MB limit prevents abuse; images larger than that are unreasonable for avatars.

**Alternatives considered:** `busboy` directly (more control, more boilerplate), `formidable` (less popular, similar API).

### Decision 3: Avatar URL scheme

**Choice:** Avatars stored as `avatars/<userId>.<ext>` with a timestamp suffix to bust cache on update. Public URL: `/uploads/avatars/<userId>_<timestamp>.<ext>`. On replace, delete old avatar file before saving new one.

**Rationale:** Predictable structure per user. Timestamp prevents browser cache from showing old avatar after update. Deleting old file prevents disk bloat from orphaned avatars.

### Decision 4: Account deletion cascade

**Choice:** Delete user data in application code using a Prisma transaction, following the cascade order:
1. Delete `RefreshToken` rows for the user
2. Delete `SavedRecipe` rows for the user
3. Delete `GroupMember` rows for the user
4. Delete `RecipeGroup` rows for recipes owned by the user
5. Delete `Ingredient` rows for recipes owned by the user
6. Delete `Recipe` rows owned by the user
7. Delete `Group` rows owned by the user (cascades remaining GroupMember/RecipeGroup)
8. Delete the `User` row
9. Delete the user's avatar file from disk

Wrap in a Prisma interactive transaction for atomicity.

**Rationale:** Prisma's `onDelete: Cascade` handles some FK cascades (SavedRecipe, RefreshToken, GroupMember), but `Recipe.authorUser` and `Group.owner` would leave orphaned rows. Explicit ordering ensures data integrity. Transaction guarantees all-or-nothing.

**Alternatives considered:** DB-level `ON DELETE CASCADE` on all FKs (cleaner but requires migration + Prisma schema annotation), soft-delete with `deletedAt` flag (adds complexity, data retention concern).

### Decision 5: Password change verification

**Choice:** `POST /v1/users/me/password` accepts `{ currentPassword, newPassword }`. Server loads user, compares `currentPassword` against stored bcrypt hash, then updates `passwordHash` with bcrypt hash of `newPassword`. Requires valid access token (auth middleware already applied).

**Rationale:** Current-password verification prevents unauthorized changes if a token is stolen. bcrypt cost factor 12 matches registration. No session invalidation needed — access tokens are short-lived (15 min).

### Decision 6: Profile update email uniqueness

**Choice:** `PATCH /v1/users/me` accepts `{ name, email }`. If email is provided and differs from current, check uniqueness against User table. Return 409 `email_already_exists` on conflict. If email equals current email, skip uniqueness check.

**Rationale:** Email is the login identifier — duplicates break auth. Same constraint as registration. Name has no uniqueness constraint.

### Decision 7: Frontend architecture for profile features

**Choice:** Add components within the existing `AccountScene` pattern:
- `AvatarUpload` — clickable avatar with hidden `<input type="file">`, preview before upload
- `EditProfileDialog` — MUI Dialog with name + email fields, save via `useMutation`
- `ChangePasswordDialog` — MUI Dialog with current + new password fields
- `DeleteAccountDialog` — confirmation dialog with email verification (type email to confirm)

Use `@tanstack/react-query` mutations for all API calls, matching existing `useUserSettingsUpdate` pattern.

**Rationale:** Consistent with existing frontend patterns. Dialog-based forms keep the settings page scannable.

### Decision 8: Group owner cannot delete account

**Choice:** Before executing account deletion, check whether the user owns any groups (`Group.ownerId = userId`). If any exist, block deletion and return a 409 with the list of owned groups. No co-member check — the current single-owner model means any owned group blocks deletion.

**Rationale:** Every group must have an owner. Allowing the owner to delete their account would leave an ownerless group. The user must transfer ownership or delete groups first. A follow-up change (`group-admin-array`) will migrate to admin arrays, at which point this guard will only block when the user is the sole remaining admin.

**Alternatives considered:**
- Auto-delete groups when owner deletes account (destructive, no warning)
- Allow orphaned groups (violates data integrity)
- Check for co-members now (premature — assumes admin array model that doesn't exist yet)

## Risks / Trade-offs

- **[Risk] Filesystem storage doesn't scale horizontally** → Mitigation: StorageProvider interface allows S3 swap. Dev-only for this change.
- **[Risk] Account deletion is irreversible** → Mitigation: Require explicit email confirmation in UI. Add prominent warning text.
- **[Risk] Avatar file not deleted if server crashes mid-request** → Mitigation: Old avatar deletion happens before new one is saved. If crash occurs after delete, user temporarily has no avatar (not catastrophic).
- **[Trade-off] No image processing (resize, optimize)** → Accepting raw uploads may result in large avatar files. 5 MB limit + browser-side preview keeps this manageable. Image processing can be added later.
