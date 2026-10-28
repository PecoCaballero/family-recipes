## Purpose

TBD — Authentication and authorization for the family-recipes API. Covers user registration, login, token refresh, logout, and auth middleware for route protection.

## Requirements

### Requirement: User can register with email and password

The system SHALL allow new users to register by providing a name, email, and password. The password SHALL be hashed using bcrypt before storage. On successful registration, the system SHALL return an access token, refresh token, and the user profile.

#### Scenario: Successful registration

- **WHEN** a new user submits valid name, email, and password (min 6 characters)
- **THEN** the system creates a User row with bcrypt-hashed password
- **THEN** the system returns a 201 response with `{ accessToken, refreshToken, user }` matching the `AuthResponse` type

#### Scenario: Duplicate email registration

- **WHEN** a user registers with an email that already exists in the database
- **THEN** the system returns a 409 error with `{ error: 'email_already_exists' }`

#### Scenario: Invalid registration input

- **WHEN** a user submits registration with missing name, missing email, or password shorter than 6 characters
- **THEN** the system returns a 400 error with `{ error: 'validation_error', details: [...] }`

### Requirement: User can login with email and password

The system SHALL authenticate users by verifying their email and bcrypt-hashed password. On success, the system SHALL generate a JWT access token (15 minute expiry) and a refresh token (7 day expiry), store the refresh token in the database, and return both tokens with the user profile.

#### Scenario: Successful login

- **WHEN** a user submits valid email and password
- **THEN** the system verifies the password against the stored bcrypt hash
- **THEN** the system generates and stores a refresh token
- **THEN** the system returns a 200 response with `{ accessToken, refreshToken, user }`

#### Scenario: Invalid credentials

- **WHEN** a user submits an email that does not exist OR an incorrect password
- **THEN** the system returns a 401 error with `{ error: 'invalid_credentials' }`
- **THEN** the system does NOT reveal whether the email or password was wrong

#### Scenario: Login with missing fields

- **WHEN** a user submits login with missing email or password
- **THEN** the system returns a 400 error with `{ error: 'validation_error' }`

### Requirement: Client can refresh access token

The system SHALL provide an endpoint to exchange a valid refresh token for a new access token and refresh token pair. The old refresh token SHALL be deleted and replaced with a new one (token rotation).

#### Scenario: Successful token refresh

- **WHEN** a client sends a valid, non-expired refresh token
- **THEN** the system looks up the token in the RefreshToken table
- **THEN** the system deletes the old token and issues a new access token and refresh token
- **THEN** the system returns a 200 response with `{ accessToken, refreshToken }`

#### Scenario: Expired refresh token

- **WHEN** a client sends a refresh token where `expiresAt < now()`
- **THEN** the system returns a 401 error with `{ error: 'token_expired' }`
- **THEN** the expired token is deleted from the database

#### Scenario: Invalid or unknown refresh token

- **WHEN** a client sends a token not found in the RefreshToken table
- **THEN** the system returns a 401 error with `{ error: 'invalid_token' }`

### Requirement: User can logout and revoke refresh token

The system SHALL provide a logout endpoint that deletes the refresh token from the database. The endpoint SHALL require a valid access token.

#### Scenario: Successful logout

- **WHEN** an authenticated user sends a logout request with their refresh token
- **THEN** the system deletes the corresponding row from RefreshToken
- **THEN** the system returns a 200 response with `{ status: 'success' }`

#### Scenario: Logout without authentication

- **WHEN** an unauthenticated client sends a logout request
- **THEN** the system returns a 401 error

### Requirement: Auth middleware protects authenticated routes

The system SHALL include Express middleware that verifies the JWT access token on every request to protected routes. The middleware SHALL extract the user ID from the token payload and attach it to the request object.

#### Scenario: Valid access token grants access

- **WHEN** a request includes a valid, non-expired `Authorization: Bearer <token>` header
- **THEN** the middleware extracts the `userId` from the token payload
- **THEN** the middleware calls `next()` and the route handler executes

#### Scenario: Missing Authorization header

- **WHEN** a request to a protected route has no Authorization header
- **THEN** the middleware returns a 401 error with `{ error: 'unauthorized' }`

#### Scenario: Expired access token

- **WHEN** a request includes an access token where `exp < now()`
- **THEN** the middleware returns a 401 error with `{ error: 'token_expired' }`

#### Scenario: Malformed or invalid token

- **WHEN** a request includes a token that is not a valid JWT (wrong signature, tampered)
- **THEN** the middleware returns a 401 error with `{ error: 'invalid_token' }`

#### Scenario: Health endpoint is not protected

- **WHEN** a request is made to `GET /health`
- **THEN** the auth middleware does NOT intercept it (by route exclusion)

#### Scenario: Auth endpoints are not protected

- **WHEN** a request is made to `POST /v1/auth/login` or `POST /v1/auth/register`
- **THEN** the auth middleware does NOT intercept it (by route exclusion)

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

### Requirement: Refresh tokens are stored hashed

The system SHALL never store a refresh token in plaintext. When a refresh token
is issued, the system SHALL persist the SHA-256 hash of the token (hex) in the
`RefreshToken.token` column, and SHALL look up refresh tokens by their hash.
The raw token SHALL only be returned to the client once at issuance.

#### Scenario: Refresh token issued and stored as hash

- **WHEN** a user logs in, registers, refreshes, or signs in with Google
- **THEN** the system stores `sha256(token)` in the RefreshToken table, not the
  raw token

#### Scenario: Refresh request matches by hash

- **WHEN** a client sends a refresh token
- **THEN** the system computes `sha256(token)` and looks it up in the
  RefreshToken table before rotating

### Requirement: JWT secret fails fast in production

The system SHALL fail fast at startup if `JWT_SECRET` is unset, empty, or equal
to a known placeholder value, in production (`NODE_ENV === 'production'`). It
SHALL NOT silently fall back to a hardcoded development secret when deploying.

#### Scenario: Missing secret in production

- **WHEN** the API starts with `NODE_ENV=production` and `JWT_SECRET` unset or
  set to a placeholder
- **THEN** the API logs a clear error and exits non-zero instead of signing
  tokens with a known secret

#### Scenario: Secret present in production

- **WHEN** the API starts with `NODE_ENV=production` and a real `JWT_SECRET`
- **THEN** the API starts normally

### Requirement: Google sign-in does not silently rebind an existing identity

The system SHALL NOT overwrite an existing user's authentication method during
Google sign-in. When the verified Google email matches a user that already has
a `passwordHash` and a different (or no) Google identity, the system SHALL
return a 409 error directing the user to sign in with their existing method,
rather than converting the account to Google-only. Only accounts with no
`passwordHash`, or accounts already bound to the same Google `sub`, SHALL be
linked automatically.

#### Scenario: Google sign-in matches an existing password account

- **WHEN** a valid Google ID token's email matches a user with a `passwordHash`
  and no matching Google `providerId`
- **THEN** the system returns a 409 error with `{ error: 'account_conflict' }`
  and does NOT modify the user's `provider`/`providerId`

#### Scenario: Google sign-in re-links the same Google identity

- **WHEN** a valid Google ID token's email and `sub` match a user already bound
  to that Google identity
- **THEN** the system returns the standard auth response without modifying the
  user

#### Scenario: New Google user is created as before

- **WHEN** a valid Google ID token has no matching email
- **THEN** the system creates a passwordless Google user as before
