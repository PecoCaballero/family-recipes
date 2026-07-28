## Purpose

TBD — Database schema and ORM configuration for the family-recipes API. Covers all tables (User, Recipe, Ingredient, SavedRecipe, RefreshToken, Group, GroupMember, RecipeGroup), Prisma ORM setup, and migration strategy.

## Requirements

### Requirement: Database provider is PostgreSQL with Prisma ORM

The backend SHALL use PostgreSQL as its database, managed through Prisma ORM. The Prisma schema SHALL be located at `apps/api/prisma/schema.prisma`. Migrations SHALL be managed via `prisma migrate`.

#### Scenario: Prisma schema is defined

- **WHEN** the project is built
- **THEN** `apps/api/prisma/schema.prisma` exists with all table definitions
- **THEN** `prisma generate` produces a typed client at `node_modules/.prisma/client`

#### Scenario: Migrations can be applied

- **WHEN** a developer runs `npx prisma migrate dev --name <name>`
- **THEN** a new migration file is created under `apps/api/prisma/migrations/`
- **THEN** the migration applies successfully to the connected PostgreSQL instance

### Requirement: User table stores account and profile data

The database SHALL contain a `User` table with fields: `id` (UUID, PK), `name` (string), `email` (string, unique), `passwordHash` (string), `avatar` (string, nullable), `language` (string, default 'en'), `privacyLevel` (string, default 'private'), `notifications` (boolean, default true), `theme` (string, default 'auto'), `createdAt` (datetime), `updatedAt` (datetime).

#### Scenario: User registration creates a row

- **WHEN** a user registers with name, email, and password
- **THEN** a new row is inserted into the User table with a UUID and hashed password
- **THEN** `createdAt` and `updatedAt` are set to the current timestamp

#### Scenario: Duplicate email is rejected

- **WHEN** a user registers with an email that already exists
- **THEN** the database returns a unique constraint violation

### Requirement: Recipe table stores recipe content

The database SHALL contain a `Recipe` table with fields: `id` (UUID, PK), `authorId` (UUID, FK → User), `name` (string), `image` (string, nullable), `description` (text), `instructions` (text), `visibility` (string, default 'private'), `lastUpdated` (datetime, default now), `createdAt` (datetime). The table SHALL support self-referencing for nested recipes via a `parentRecipeId` (UUID, nullable, FK → Recipe).

#### Scenario: Recipe is created by an authenticated user

- **WHEN** an authenticated user creates a recipe
- **THEN** a new row is inserted into the Recipe table with `authorId` set to the user's UUID
- **THEN** `visibility` defaults to the author's `privacyLevel`

#### Scenario: Nested recipe references another recipe

- **WHEN** a recipe references a sub-recipe via `parentRecipeId`
- **THEN** the foreign key constraint SHALL prevent deletion of the parent while children exist (ON DELETE RESTRICT)
- **THEN** querying the parent recipe can include its children via Prisma relations

### Requirement: Ingredient table stores recipe ingredients

The database SHALL contain an `Ingredient` table with fields: `id` (UUID, PK), `recipeId` (UUID, FK → Recipe), `name` (string), `unit` (string, nullable), `quantity` (string). Each ingredient SHALL belong to exactly one recipe.

#### Scenario: Ingredients are created with a recipe

- **WHEN** a recipe with ingredients is created
- **THEN** one row per ingredient is inserted into the Ingredient table
- **THEN** each row references the parent recipe via `recipeId`

#### Scenario: Ingredients are updated when recipe is edited

- **WHEN** a recipe edit changes its ingredient list
- **THEN** old ingredients for that recipe are deleted and new ones inserted (replace strategy)

### Requirement: SavedRecipes junction table tracks saved recipes

The database SHALL contain a `SavedRecipe` junction table with fields: `userId` (UUID, FK → User), `recipeId` (UUID, FK → Recipe). The composite `(userId, recipeId)` SHALL be unique.

#### Scenario: User saves a recipe

- **WHEN** a user saves a recipe
- **THEN** a row is inserted into SavedRecipe linking the user and recipe

#### Scenario: User unsaves a recipe

- **WHEN** a user unsaves a recipe
- **THEN** the corresponding row is deleted from SavedRecipe

### Requirement: RefreshToken table stores active refresh tokens

The database SHALL contain a `RefreshToken` table with fields: `id` (UUID, PK), `token` (string, unique, indexed), `userId` (UUID, FK → User), `expiresAt` (datetime), `createdAt` (datetime).

#### Scenario: Refresh token is issued on login

- **WHEN** a user logs in successfully
- **THEN** a new row is inserted into RefreshToken with a cryptographically random token value

#### Scenario: Refresh token is deleted on logout

- **WHEN** a user logs out
- **THEN** the corresponding row is deleted from RefreshToken

#### Scenario: Expired tokens can be cleaned up

- **WHEN** a cleanup job runs
- **THEN** all rows where `expiresAt < now()` are deleted

### Requirement: Group table and junction tables exist for future phases

The database SHALL contain `Group`, `GroupMember`, and `RecipeGroup` tables as placeholders matching the existing `Group` type structure, with minimal foreign key relations. These tables SHALL NOT be used by routes in this phase.

#### Scenario: Group tables exist for forward compatibility

- **WHEN** the Prisma migration runs
- **THEN** Group, GroupMember, and RecipeGroup tables are created
- **THEN** the API routes in this phase do not reference these tables
