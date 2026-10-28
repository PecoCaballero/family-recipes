## MODIFIED Requirements

### Requirement: Admins can batch-add recipes to a group

The system SHALL allow group admins to add multiple recipes to a group in a
single request via `POST /v1/groups/:id/recipes/batch`. The request body SHALL
contain `{ recipeIds: string[] }` with 1–50 recipe IDs. The system SHALL verify
that every requested recipe is visible to the acting admin (author, `public`,
or already in a group the admin belongs to) and SHALL reject the request (404)
if any requested recipe is not visible, before upserting any RecipeGroup rows
in a Prisma transaction. The response SHALL indicate which recipes were newly
added and which were already in the group. Non-admins SHALL receive a 403 error.

#### Scenario: Admin batch-adds new visible recipes

- **WHEN** a group admin sends `POST /v1/groups/:id/recipes/batch` with
  `{ recipeIds: [id1, id2, id3] }`, all visible to the admin
- **THEN** the system upserts 3 RecipeGroup rows in a single transaction
- **THEN** the system returns `{ added: [id1, id2, id3], skipped: [] }`

#### Scenario: Batch-add includes an invisible recipe

- **WHEN** a group admin sends batch-add where at least one recipe is another
  user's private recipe not visible to the admin
- **THEN** the system returns a 404 error and does not create any association

#### Scenario: Batch-add includes already-shared recipes

- **WHEN** a group admin sends batch-add where 2 of 3 recipes are already shared to the group
- **THEN** the system adds only the 1 new recipe
- **THEN** the system returns `{ added: [newId], skipped: [existingId1, existingId2] }`

#### Scenario: Empty recipeIds array rejected

- **WHEN** a group admin sends `POST /v1/groups/:id/recipes/batch` with `{ recipeIds: [] }`
- **THEN** the system returns a 400 error with `{ error: 'validation_error' }`

#### Scenario: Too many recipeIds rejected

- **WHEN** a group admin sends more than 50 recipe IDs in the batch
- **THEN** the system returns a 400 error with `{ error: 'validation_error' }`

#### Scenario: Non-admin cannot batch-add recipes

- **WHEN** a non-admin authenticated user sends `POST /v1/groups/:id/recipes/batch`
- **THEN** the system returns a 403 error
