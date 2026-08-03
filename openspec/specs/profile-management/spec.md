## Purpose

User profile management allowing users to update their display name and email address.

## Requirements

### Requirement: User can update their profile information

The system SHALL allow authenticated users to update their display name and/or email address. Email changes SHALL be validated for uniqueness. The system SHALL return the updated user profile on success.

#### Scenario: Update display name

- **WHEN** an authenticated user sends `PATCH /v1/users/me` with `{ "name": "New Name" }`
- **THEN** the system updates the User row's `name` field
- **THEN** the system returns a 200 response with the full updated user object (including `id`, `name`, `email`, `avatar`, `settings`, `recipesSaved`, `recipesSharedByOthers`, `createdAt`, `updatedAt`)

#### Scenario: Update email to a new unique value

- **WHEN** an authenticated user sends `PATCH /v1/users/me` with `{ "email": "newemail@example.com" }` and no other user has that email
- **THEN** the system updates the User row's `email` field
- **THEN** the system returns a 200 response with the updated user object

#### Scenario: Update email to an already-taken email

- **WHEN** an authenticated user sends `PATCH /v1/users/me` with an email that belongs to another user
- **THEN** the system returns a 409 error with `{ error: 'email_already_exists' }`

#### Scenario: Update email to same email (no-op)

- **WHEN** an authenticated user sends `PATCH /v1/users/me` with `{ "email": "<current email>" }`
- **THEN** the system updates the row (no-op) and returns a 200 response

#### Scenario: Update both name and email

- **WHEN** an authenticated user sends `PATCH /v1/users/me` with `{ "name": "New Name", "email": "new@example.com" }`
- **THEN** the system updates both fields and returns a 200 response with the updated user

#### Scenario: Profile update without authentication

- **WHEN** an unauthenticated client sends `PATCH /v1/users/me`
- **THEN** the system returns a 401 error with `{ error: 'unauthorized' }`

#### Scenario: Profile update with empty name

- **WHEN** an authenticated user sends `PATCH /v1/users/me` with `{ "name": "" }`
- **THEN** the system returns a 400 error with `{ error: 'validation_error', details: [...] }`

#### Scenario: Profile update with invalid email

- **WHEN** an authenticated user sends `PATCH /v1/users/me` with `{ "email": "not-an-email" }`
- **THEN** the system returns a 400 error with `{ error: 'validation_error', details: [...] }`

#### Scenario: Profile update with no fields

- **WHEN** an authenticated user sends `PATCH /v1/users/me` with `{}`
- **THEN** the system returns a 400 error with `{ error: 'validation_error', detail: 'At least one field (name or email) must be provided' }`
