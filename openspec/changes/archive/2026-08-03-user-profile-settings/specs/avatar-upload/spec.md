## ADDED Requirements

### Requirement: User can upload an avatar image

The system SHALL allow authenticated users to upload a profile avatar image via multipart form data. The system SHALL accept only `image/*` MIME types and SHALL reject files larger than 5 MB. On successful upload, the system SHALL store the file on the filesystem, update the user's `avatar` field to the file URL, and return the new avatar URL.

#### Scenario: Successful avatar upload

- **WHEN** an authenticated user sends a `POST /v1/users/me/avatar` request with a valid image file (JPEG, PNG, WebP, or GIF) under 5 MB
- **THEN** the system saves the file to `uploads/avatars/<userId>_<timestamp>.<ext>`
- **THEN** the system updates the User row's `avatar` field to `/uploads/avatars/<userId>_<timestamp>.<ext>`
- **THEN** the system returns a 200 response with `{ avatarUrl: "/uploads/avatars/<userId>_<timestamp>.<ext>" }`

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

The system SHALL replace a user's existing avatar when a new avatar is uploaded. The system SHALL delete the old avatar file from the filesystem before saving the new one.

#### Scenario: Replacing existing avatar

- **WHEN** an authenticated user who already has an avatar uploads a new valid image
- **THEN** the system deletes the old avatar file from `uploads/avatars/`
- **THEN** the system saves the new file and updates the User row with the new URL
- **THEN** the system returns a 200 response with the new `avatarUrl`

### Requirement: User can remove their avatar

The system SHALL allow users to remove their avatar, reverting to the initial-letter fallback. The avatar file SHALL be deleted from the filesystem.

#### Scenario: Successful avatar removal

- **WHEN** an authenticated user sends `DELETE /v1/users/me/avatar`
- **THEN** the system deletes the avatar file from `uploads/avatars/` if it exists
- **THEN** the system sets the User row's `avatar` field to `null`
- **THEN** the system returns a 200 response with `{ avatarUrl: null }`

#### Scenario: Removing avatar when none exists

- **WHEN** an authenticated user who has no avatar sends `DELETE /v1/users/me/avatar`
- **THEN** the system sets `avatar` to `null` (no-op)
- **THEN** the system returns a 200 response with `{ avatarUrl: null }`

### Requirement: Avatar files are served as static resources

The system SHALL serve avatar files via Express static file middleware under the `/uploads/avatars/` URL path.

#### Scenario: Accessing an existing avatar

- **WHEN** a client requests `GET /uploads/avatars/<filename>`
- **THEN** the system returns the file with the correct `Content-Type` header (derived from file extension)
- **THEN** the response includes cache-friendly headers (ETag, Last-Modified)
