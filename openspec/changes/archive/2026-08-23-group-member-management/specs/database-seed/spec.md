## ADDED Requirements

### Requirement: Prisma seed script exists

The system SHALL provide a seed script at `apps/api/prisma/seed.ts` that populates the database with sample data for development and testing. The script SHALL be idempotent — running it multiple times SHALL NOT create duplicate data. The script SHALL be runnable via `npx prisma db seed` and configured via `package.json` `prisma.seed` field.

#### Scenario: Seed script creates sample data

- **WHEN** `npx prisma db seed` is run against an empty database
- **THEN** the script creates 5 users with hashed passwords
- **THEN** the script creates 15 recipes with ingredients across multiple authors
- **THEN** the script creates 3 groups with varied memberships and admin roles
- **THEN** the script shares some recipes to groups

#### Scenario: Seed script is idempotent

- **WHEN** `npx prisma db seed` is run a second time
- **THEN** the script detects existing users by email and skips duplicate creation
- **THEN** no duplicate rows are inserted
- **THEN** the script completes without errors

### Requirement: Seed data is realistic and useful

The system SHALL seed data that covers all major app features: users with varied names/emails/avatars, recipes with realistic ingredients/instructions, groups with descriptive names, and mixed membership with both admin and non-admin members. The seed SHALL NOT reference any external APIs or services.

#### Scenario: Seed users have realistic data

- **WHEN** the seed script runs
- **THEN** users are created with names like "Alice Johnson", "Bob Smith" etc.
- **THEN** each user has a unique email (e.g., alice@example.com)
- **THEN** all users have the same password for easy testing (e.g., "password123")

#### Scenario: Seed recipes have ingredients and instructions

- **WHEN** the seed script runs
- **THEN** recipes are created with 4–8 ingredients each
- **THEN** each recipe has multi-step cooking instructions
- **THEN** recipes have varying visibility (public/private)

#### Scenario: Seed groups have realistic configurations

- **WHEN** the seed script runs
- **THEN** groups are created with descriptive names like "Sunday Dinner Club", "Baking Enthusiasts", "Quick Weeknight Meals"
- **THEN** each group has at least 2 members
- **THEN** at least one group has multiple admins

### Requirement: Seed script is configured in package.json

The `apps/api/package.json` SHALL include a `prisma.seed` field pointing to the seed script. A convenience `yarn seed` script SHALL be available at the workspace root or api app level.

#### Scenario: Seed can be run from api directory

- **WHEN** `yarn seed` is run from `apps/api`
- **THEN** the Prisma seed script executes

#### Scenario: Seed can be run from workspace root

- **WHEN** `yarn seed` is run from the workspace root
- **THEN** the Prisma seed script executes (via Nx target or yarn workspace command)
