## ADDED Requirements

### Requirement: User can change their password

The system SHALL allow an authenticated user to change their password by providing their current password and a new password. The system SHALL verify the current password against the stored bcrypt hash before accepting the change. The new password SHALL be hashed with bcrypt (cost factor 12) and stored, replacing the previous hash.

#### Scenario: Successful password change

- **WHEN** an authenticated user sends `POST /v1/users/me/password` with `{ "currentPassword": "<correct>", "newPassword": "<new value, min 6 chars>" }`
- **THEN** the system verifies the current password matches the stored bcrypt hash
- **THEN** the system hashes the new password with bcrypt (cost factor 12)
- **THEN** the system updates the User row's `passwordHash` field
- **THEN** the system returns a 200 response with `{ status: 'password_updated' }`

#### Scenario: Password change with incorrect current password

- **WHEN** an authenticated user sends `POST /v1/users/me/password` with an incorrect `currentPassword`
- **THEN** the system returns a 401 error with `{ error: 'invalid_current_password' }`

#### Scenario: Password change with new password too short

- **WHEN** an authenticated user sends `POST /v1/users/me/password` with `newPassword` shorter than 6 characters
- **THEN** the system returns a 400 error with `{ error: 'validation_error', details: ['Password must be at least 6 characters'] }`

#### Scenario: Password change without authentication

- **WHEN** an unauthenticated client sends `POST /v1/users/me/password`
- **THEN** the system returns a 401 error with `{ error: 'unauthorized' }`

#### Scenario: Password change with missing fields

- **WHEN** an authenticated user sends `POST /v1/users/me/password` without `currentPassword` or `newPassword`
- **THEN** the system returns a 400 error with `{ error: 'validation_error', details: [...] }`
