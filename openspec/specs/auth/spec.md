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
