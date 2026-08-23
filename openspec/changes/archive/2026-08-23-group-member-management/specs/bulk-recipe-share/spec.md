## ADDED Requirements

### Requirement: Admins can batch-add recipes to a group

The system SHALL allow group admins to add multiple recipes to a group in a single request via `POST /v1/groups/:id/recipes/batch`. The request body SHALL contain `{ recipeIds: string[] }` with 1–50 recipe IDs. The system SHALL upsert all RecipeGroup rows in a Prisma transaction. The response SHALL indicate which recipes were newly added and which were already in the group. Non-admins SHALL receive a 403 error.

#### Scenario: Admin batch-adds new recipes

- **WHEN** a group admin sends `POST /v1/groups/:id/recipes/batch` with `{ recipeIds: [id1, id2, id3] }`
- **THEN** the system upserts 3 RecipeGroup rows in a single transaction
- **THEN** the system returns `{ added: [id1, id2, id3], skipped: [] }`

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

### Requirement: Group detail page has a FAB for bulk recipe sharing

The system SHALL render a `<FloatingActionButton />` on the group detail page (`/groups/:id`) for all group members. The FAB SHALL display a "share" or "add recipe" icon and have a tooltip. Clicking the FAB SHALL open a `BulkShareDialog` component.

#### Scenario: Group member sees share FAB on detail page

- **WHEN** a group member navigates to `/groups/:id`
- **THEN** a FAB with share icon is rendered at the bottom-right
- **THEN** hovering shows a tooltip (i18n key)

#### Scenario: Non-member does not see FAB

- **WHEN** a non-member user navigates to `/groups/:id`
- **THEN** the page shows a 404 state and the FAB is not rendered

### Requirement: BulkShareDialog shows unshared recipes for selection

The system SHALL provide a `BulkShareDialog` component that fetches all recipes authored by the current user and filters out those already shared to the current group. The dialog SHALL display recipes as selectable cards with checkboxes. The user SHALL be able to select one or more recipes and confirm sharing. On confirm, the dialog SHALL call `POST /v1/groups/:id/recipes/batch`. On success, the dialog SHALL close and the group detail page SHALL refresh.

#### Scenario: Dialog loads user's unshared recipes

- **WHEN** the BulkShareDialog opens for a group
- **THEN** the dialog fetches `GET /v1/recipes` for the current user
- **THEN** recipes already in the group (from `GET /v1/groups/:id` `recipeIds`) are filtered out
- **THEN** only unshared recipes are shown as selectable cards

#### Scenario: User selects and shares multiple recipes

- **WHEN** the user selects 3 recipes and clicks confirm
- **THEN** the dialog calls `POST /v1/groups/:id/recipes/batch` with the selected recipe IDs
- **THEN** on success, the dialog closes and the group detail refetches

#### Scenario: User has no unshared recipes

- **WHEN** the BulkShareDialog opens but all user's recipes are already shared to the group
- **THEN** an empty state message is displayed (i18n key)

#### Scenario: Dialog shows loading state during submission

- **WHEN** the user confirms the selection
- **THEN** the confirm button shows a loading spinner and is disabled
- **THEN** the dialog closes on success or shows error on failure

### Requirement: Bulk recipe share Zod schema

The system SHALL define a `batchAddRecipesSchema` in `@family-recipe/shared` validating `{ recipeIds: string[].min(1).max(50) }` with UUID validation on each element.

#### Scenario: Schema validates valid input

- **WHEN** `batchAddRecipesSchema.safeParse({ recipeIds: [uuid1, uuid2] })` is called
- **THEN** `success` is true

#### Scenario: Schema rejects empty array

- **WHEN** `batchAddRecipesSchema.safeParse({ recipeIds: [] })` is called
- **THEN** `success` is false with a length error

#### Scenario: Schema rejects more than 50 IDs

- **WHEN** `batchAddRecipesSchema.safeParse({ recipeIds: Array(51).fill(uuid) })` is called
- **THEN** `success` is false with a max length error
