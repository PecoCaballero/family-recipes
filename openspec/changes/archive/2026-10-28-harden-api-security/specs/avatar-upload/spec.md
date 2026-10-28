## MODIFIED Requirements

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
