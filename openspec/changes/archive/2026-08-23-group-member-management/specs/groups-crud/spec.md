## ADDED Requirements

### Requirement: Group admins can batch-add recipes to a group

The system SHALL allow group admins to add multiple recipes to a group in a single request via `POST /v1/groups/:id/recipes/batch`. The request body SHALL contain `{ recipeIds: string[] }` with 1–50 recipe IDs. The system SHALL upsert all RecipeGroup rows in a Prisma transaction. The response SHALL indicate which recipes were newly added and which were already in the group (`{ added: string[], skipped: string[] }`). Non-admins SHALL receive a 403 error.

#### Scenario: Admin batch-adds new recipes

- **WHEN** a group admin sends `POST /v1/groups/:id/recipes/batch` with `{ recipeIds: [id1, id2, id3] }`
- **THEN** the system upserts 3 RecipeGroup rows in a single transaction
- **THEN** the system returns `{ added: [id1, id2, id3], skipped: [] }`

#### Scenario: Batch-add includes already-shared recipes

- **WHEN** a group admin sends batch-add where 2 of 3 recipes are already shared
- **THEN** the system returns `{ added: [newId], skipped: [existingId1, existingId2] }`

#### Scenario: Empty array rejected

- **WHEN** a group admin sends batch-add with `{ recipeIds: [] }`
- **THEN** the system returns a 400 error with `{ error: 'validation_error' }`

#### Scenario: Too many IDs rejected

- **WHEN** a group admin sends more than 50 recipe IDs
- **THEN** the system returns a 400 error with `{ error: 'validation_error' }`

#### Scenario: Non-admin cannot batch-add

- **WHEN** a non-admin authenticated user sends `POST /v1/groups/:id/recipes/batch`
- **THEN** the system returns a 403 error
