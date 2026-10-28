## Purpose

Avatar image upload, replacement, and removal for user profiles. Files stored on local filesystem and served via static middleware.

## Requirements

### Requirement: User can upload an avatar image

The system SHALL allow authenticated users to upload a profile avatar image via
multipart form data. The system SHALL accept only `image/*` MIME types and SHALL
reject files larger than 5 MB. The stored filename SHALL be generated entirely
server-side from the user ID and a timestamp plus a MIME-derived extension from
a server-side allowlist; the client-supplied `originalname` SHALL NOT be used to
construct the stored path. On successful upload, the system SHALL store the file
via the selected storage provider, update the user's `avatar` field to the
resulting URL, and return the avatar URL.

#### Scenario: Successful avatar upload (local storage)

- **WHEN** an authenticated user sends a `POST /v1/users/me/avatar` request with a valid image file (JPEG, PNG, WebP, or GIF) under 5 MB, and the storage provider is `local`
- **THEN** the system saves the file to `uploads/avatars/<userId>_<timestamp>.<ext>` where `<ext>` comes from the MIME allowlist
- **THEN** the system updates the User row's `avatar` field to `/uploads/avatars/<userId>_<timestamp>.<ext>`
- **THEN** the system returns a 200 response with `{ avatarUrl: "/uploads/avatars/<userId>_<timestamp>.<ext>" }`

#### Scenario: Malicious originalname cannot traverse directories

- **WHEN** an authenticated user uploads an image whose `originalname` contains path segments (e.g. `../../evil.png` or `x.png/../../../.env`)
- **THEN** the stored filename contains no path separators and resolves inside `uploads/avatars/`
- **THEN** no file is written outside the uploads directory

#### Scenario: Successful avatar upload (S3 storage)

- **WHEN** an authenticated user sends a `POST /v1/users/me/avatar` request with a valid image file under 5 MB, and the storage provider is `s3`
- **THEN** the system stores the object in the configured bucket
- **THEN** the system updates the User row's `avatar` field to an absolute URL rooted at `S3_PUBLIC_URL`
- **THEN** the system returns a 200 response with the absolute `avatarUrl`

#### Scenario: Avatar upload without authentication

- **WHEN** an unauthenticated client sends `POST /v1/users/me/avatar`
- **THEN** the system returns a 401 error with `{ error: 'unauthorized' }`

#### Scenario: Avatar upload with non-image file

- **WHEN** an authenticated user uploads a file with a non-image MIME type (e.g., `application/pdf`)
- **THEN** the system returns a 400 error with `{ error: 'invalid_file_type', detail: 'Only image files (JPEG, PNG, WebP, GIF) are accepted' }`

#### Scenario: Avatar upload exceeding size limit

- **WHEN** an authenticated user uploads an image file larger than 5 MB
- **THEN** the system returns a 413 error with `{ error: 'file_too_large', detail: 'Maximum file size is 5 MB' }`

#### Scenario: Avatar upload with no file

- **WHEN** an authenticated user sends `POST /v1/users/me/avatar` without a file in the multipart body
- **THEN** the system returns a 400 error with `{ error: 'validation_error', detail: 'No file uploaded' }`

### Requirement: User can replace their avatar

The system SHALL replace a user's existing avatar when a new avatar is uploaded. The system SHALL delete the old avatar file from the selected storage provider before saving the new one.

#### Scenario: Replacing existing avatar

- **WHEN** an authenticated user who already has an avatar uploads a new valid image
- **THEN** the system deletes the old avatar file from the selected storage provider
- **THEN** the system saves the new file and updates the User row with the new URL
- **THEN** the system returns a 200 response with the new `avatarUrl`

### Requirement: User can remove their avatar

The system SHALL allow users to remove their avatar, reverting to the initial-letter fallback. The avatar file SHALL be deleted from the selected storage provider.

#### Scenario: Successful avatar removal

- **WHEN** an authenticated user sends `DELETE /v1/users/me/avatar`
- **THEN** the system deletes the avatar file from the selected storage provider if it exists
- **THEN** the system sets the User row's `avatar` field to `null`
- **THEN** the system returns a 200 response with `{ avatarUrl: null }`

#### Scenario: Removing avatar when none exists

- **WHEN** an authenticated user who has no avatar sends `DELETE /v1/users/me/avatar`
- **THEN** the system sets `avatar` to `null` (no-op)
- **THEN** the system returns a 200 response with `{ avatarUrl: null }`

### Requirement: Avatar files are served as static resources

In `local` mode, the system SHALL serve avatar files via Express static file middleware under the `/uploads/avatars/` URL path. In `s3` mode, the system SHALL NOT serve files itself; avatars SHALL be served by the object storage provider via the absolute URLs stored on the User row.

#### Scenario: Accessing an existing avatar (local)

- **WHEN** a client requests `GET /uploads/avatars/<filename>` and the storage provider is `local`
- **THEN** the system returns the file with the correct `Content-Type` header (derived from file extension)
- **THEN** the response includes cache-friendly headers (ETag, Last-Modified)

#### Scenario: Avatar served by object storage (S3)

- **WHEN** a client resolves a user's avatar URL and the storage provider is `s3`
- **THEN** the URL is an absolute public URL pointing at the object storage provider
- **THEN** the object storage provider serves the image directly, bypassing the API

### Requirement: Storage provider is selectable by environment

The system SHALL select the avatar storage backend from the `STORAGE_PROVIDER` environment variable, with values `local` (default) and `s3`. When `STORAGE_PROVIDER` is unset or `local`, the system SHALL use local filesystem storage. When `STORAGE_PROVIDER=s3`, the system SHALL use an S3-compatible object store configured via `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, and `S3_PUBLIC_URL`.

#### Scenario: Default provider is local

- **WHEN** the API starts with `STORAGE_PROVIDER` unset or set to `local`
- **THEN** avatar uploads are written to the local filesystem under `uploads/avatars/`
- **THEN** returned avatar URLs are relative `/uploads/avatars/<filename>` paths

#### Scenario: S3 provider selected

- **WHEN** the API starts with `STORAGE_PROVIDER=s3` and valid `S3_*` configuration
- **THEN** avatar uploads are written to the configured object storage bucket
- **THEN** returned avatar URLs are absolute URLs rooted at `S3_PUBLIC_URL`
