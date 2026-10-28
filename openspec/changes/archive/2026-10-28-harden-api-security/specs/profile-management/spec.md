## ADDED Requirements

### Requirement: User can update their settings with validation

The system SHALL allow an authenticated user to update their account settings
(language, privacyLevel, notifications, theme) via
`PATCH /v1/users/me/settings`. The request body SHALL be validated against a
schema that constrains each field to its allowed enum values. Invalid values
SHALL return a 400 error rather than a 500.

#### Scenario: Valid settings update

- **WHEN** an authenticated user sends `PATCH /v1/users/me/settings` with
  `{ "theme": "dark", "notifications": false }`
- **THEN** the system updates the User row and returns a 200 with the updated user

#### Scenario: Invalid enum value rejected

- **WHEN** an authenticated user sends `PATCH /v1/users/me/settings` with
  `{ "privacyLevel": "not-a-real-level" }`
- **THEN** the system returns a 400 error with `{ error: 'validation_error', details: [...] }`
  and does not update the row

#### Scenario: Settings update without authentication

- **WHEN** an unauthenticated client sends `PATCH /v1/users/me/settings`
- **THEN** the system returns a 401 error
