## ADDED Requirements

### Requirement: Production database connections verify TLS

The system SHALL verify the server certificate whenever it connects to
PostgreSQL over TLS (DATABASE_URL with `sslmode=require`). It SHALL NOT disable
certificate verification via `rejectUnauthorized: false`.

#### Scenario: TLS with verification

- **WHEN** the API connects to a hosted database with `sslmode=require`
- **THEN** the connection verifies the server's certificate (equivalent to
  `rejectUnauthorized: true`)
- **THEN** a self-signed or mismatched certificate causes the connection to fail
  rather than succeed silently

#### Scenario: Local connections are unaffected

- **WHEN** the DATABASE_URL has no `sslmode` (local development)
- **THEN** the connection does not require TLS
