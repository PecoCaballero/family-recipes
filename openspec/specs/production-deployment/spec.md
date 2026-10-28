# production-deployment Specification

## Purpose

TBD - created by archiving change add-production-deployment. Update Purpose after archive.

## Requirements

### Requirement: Production configuration is environment-driven

The system SHALL obtain all production configuration (database URL, JWT secret, Google client ID, AI credentials, CORS origin, storage credentials) from environment variables. The system SHALL NOT hardcode secrets or host-specific values in source code or committed files.

#### Scenario: API boots from environment variables

- **WHEN** the API starts in production with `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `STORAGE_PROVIDER`, and `S3_*` set
- **THEN** the API connects to the configured database, signs/verifies JWTs with `JWT_SECRET`, and restricts CORS to `CORS_ORIGIN`
- **THEN** no secret values appear in the committed source

### Requirement: Database connection supports TLS

The system SHALL establish TLS-secured connections to the PostgreSQL database when the connection URL requires it (`sslmode=require`). The TLS behavior SHALL be driven by the connection URL or an explicit environment flag rather than being unconditionally enabled.

#### Scenario: Connection with sslmode=require

- **WHEN** `DATABASE_URL` contains `sslmode=require`
- **THEN** the Prisma driver adapter configures the underlying connection with TLS enabled
- **THEN** the API connects successfully to a hosted PostgreSQL endpoint

#### Scenario: Local connection without TLS

- **WHEN** `DATABASE_URL` points at a local Postgres without `sslmode=require`
- **THEN** the connection proceeds without TLS, preserving the existing local development behavior

### Requirement: Migrations are applied before the server starts in production

The system SHALL run `prisma migrate deploy` as part of the production deploy, before the API begins serving traffic, so the database schema matches the committed migration history.

#### Scenario: Deploy applies pending migrations

- **WHEN** a production deploy runs with a `DATABASE_URL` pointing at the hosted database
- **THEN** `prisma migrate deploy` applies any pending migrations
- **THEN** the API starts only after migrations complete successfully

### Requirement: Health endpoint is available for platform checks

The system SHALL expose an unauthenticated `GET /health` endpoint returning HTTP 200 with `{ "status": "ok" }` for use by platform health checks and load balancers.

#### Scenario: Health check succeeds

- **WHEN** a client or platform sends `GET /health`
- **THEN** the system returns 200 with `{ "status": "ok" }`

### Requirement: CORS is restricted to the configured origin in production

The system SHALL restrict cross-origin requests in production to the origin(s) specified by `CORS_ORIGIN`. When `CORS_ORIGIN` is set, requests from other origins SHALL be rejected by the CORS policy.

#### Scenario: Allowed origin is accepted

- **WHEN** the frontend origin matches `CORS_ORIGIN`
- **THEN** the API returns the appropriate CORS headers permitting the request

#### Scenario: Disallowed origin is rejected

- **WHEN** a request originates from an origin not matching `CORS_ORIGIN`
- **THEN** the browser CORS policy blocks the response from being read

### Requirement: API has a deterministic production start command

The system SHALL provide a single, deterministic start command that launches the compiled API from its build output directory, independent of the Nx serve/watch dev workflow.

#### Scenario: Production start command boots the API

- **WHEN** the build output exists at `dist/apps/api/apps/api/src/index.js`
- **THEN** running `node dist/apps/api/apps/api/src/index.js` starts the API and serves `/health`
