## ADDED Requirements

### Requirement: User can sign in with Google

The system SHALL allow a user to authenticate with Google by presenting a Google
ID token. The API SHALL verify the token's signature, issuer, audience, and
expiry, then find or create the corresponding user and return
`{ accessToken, refreshToken, user }` consistent with the existing auth flow.

#### Scenario: Existing user signs in with Google

- **WHEN** a client sends a valid Google ID token for an email that already has
  a user
- **THEN** the system returns a 200 response with `{ accessToken, refreshToken,
user }` and links the Google identity to that user

#### Scenario: New user signs in with Google

- **WHEN** a client sends a valid Google ID token for an email with no existing
  user
- **THEN** the system creates a User with `provider: 'google'` and the Google
  `sub` as `providerId`, no password, and returns the standard auth response

#### Scenario: Invalid Google token

- **WHEN** a client sends a Google ID token that fails verification (bad
  signature, wrong audience, or expired)
- **THEN** the system returns a 401 error with `{ error: 'invalid_google_token' }`

#### Scenario: Missing token

- **WHEN** a client calls the Google sign-in endpoint without an ID token
- **THEN** the system returns a 400 error with `{ error: 'validation_error' }`

### Requirement: Passwordless accounts cannot use password login

A user created via Google SHALL have no password. Attempting email/password
login for such an account, or any mismatch, SHALL return the standard
`invalid_credentials` error without revealing the account's auth method.

#### Scenario: Password login on Google-only account

- **WHEN** a user with only a Google identity submits email/password login
- **THEN** the system returns a 401 error with `{ error: 'invalid_credentials' }`

### Requirement: Google Sign-In button is functional and Apple is removed

The web login SHALL present a working Google Sign-In button and SHALL NOT
present an Apple button.

#### Scenario: Google button initiates sign-in

- **WHEN** a user clicks "Continue with Google"
- **THEN** the app obtains a Google ID token and calls the Google sign-in
  endpoint, then logs the user in on success

#### Scenario: No fake Apple button

- **WHEN** the login screen renders
- **THEN** no Apple sign-in button is shown
