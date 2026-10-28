## ADDED Requirements

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
