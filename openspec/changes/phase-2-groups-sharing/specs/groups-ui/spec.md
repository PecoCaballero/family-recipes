## ADDED Requirements

### Requirement: User can create a group from the frontend

The system SHALL provide a Create Group page at `/groups/create` with a form containing fields for `name` (required), `description` (required), and `icon` (optional). On submission, the form SHALL call `POST /v1/groups` with the form data. On success, the user SHALL be redirected to the group detail page. On validation error, field-level errors SHALL be displayed.

#### Scenario: User creates a group successfully

- **WHEN** an authenticated user fills in name and description and submits the form
- **THEN** the system calls `POST /v1/groups` with the form data
- **THEN** on 201 response, the user is redirected to `/groups/:id`

#### Scenario: Validation error on create

- **WHEN** a user submits the form with empty name or empty description
- **THEN** the form displays field-level validation errors (e.g., "Name is required")
- **THEN** no API call is made

### Requirement: User can edit a group from the frontend

The system SHALL provide an Edit Group page at `/groups/:id/edit` with a form pre-populated with the group's current data. On submission, the form SHALL call `PATCH /v1/groups/:id`. On success, the user SHALL be redirected to the group detail page.

#### Scenario: Admin edits a group successfully

- **WHEN** a group admin navigates to `/groups/:id/edit`, modifies fields, and submits
- **THEN** the system calls `PATCH /v1/groups/:id` with the updated data
- **THEN** on 200 response, the user is redirected to `/groups/:id`

#### Scenario: Non-admin sees error on edit

- **WHEN** a non-admin navigates to `/groups/:id/edit` and attempts to submit
- **THEN** the API returns a 403 error and the form displays the error message

### Requirement: User can delete a group from the frontend

The system SHALL provide a delete button on the group detail page. When clicked, a confirmation dialog SHALL appear. On confirmation, the system SHALL call `DELETE /v1/groups/:id`. On success, the user SHALL be redirected to the groups list. The delete button SHALL only be visible when `isAdmin` is true.

#### Scenario: Admin deletes a group

- **WHEN** a group admin clicks delete, confirms the dialog
- **THEN** the system calls `DELETE /v1/groups/:id`
- **THEN** on 204 response, the user is redirected to `/groups`

#### Scenario: Non-admin does not see delete button

- **WHEN** a non-admin views the group detail page
- **THEN** the delete button is not rendered

### Requirement: SendRecipeDrawer loads groups from API with skeleton loading

The `SendRecipeDrawer` component SHALL load the current user's groups from `GET /v1/groups` instead of using mock data. It SHALL display a loading state using the shared `<ContentSkeleton variant="list" />` component while fetching. On group selection, it SHALL call `POST /v1/groups/:id/recipes` with the recipe's ID. A success notification SHALL be shown.

#### Scenario: Drawer loads user's groups

- **WHEN** a user opens the Send to Group drawer from a recipe page
- **THEN** the drawer fetches `GET /v1/groups` and displays the user's groups
- **THEN** a `<ContentSkeleton variant="list" />` is shown while the API call is in progress

#### Scenario: User sends recipe to group

- **WHEN** the user selects a group from the drawer
- **THEN** the system calls `POST /v1/groups/:id/recipes` with `{ recipeId }`
- **THEN** a success snackbar or notification is displayed

#### Scenario: User has no groups

- **WHEN** the drawer loads and the user has no groups
- **THEN** an empty state message is shown (e.g., "You don't have any groups yet")

### Requirement: All async views render skeleton loading states

The system SHALL provide a reusable `<ContentSkeleton />` component (`apps/web/src/components/ContentSkeleton.tsx`) with `variant` (card, form, list, table, text), `count` (for repeating items), and optional `height`/`width` props. All group-related views that fetch data asynchronously SHALL use this component instead of blank loading states or ad-hoc skeletons:
- Group list (`/groups/page.tsx`) — `variant="list" count={5}`
- Group detail (`/groups/[id]/page.tsx`) — `variant="card"`
- Create Group form (while mutations are pending) — `variant="form"`
- Edit Group form (while existing group data loads) — `variant="form"`
- SendRecipeDrawer (while groups load) — `variant="list" count={3}`

#### Scenario: Group list skeleton renders on mount

- **WHEN** a user navigates to `/groups`
- **THEN** a skeleton list with placeholder items is shown immediately while `useGroupsQuery` fetches
- **THEN** real group data replaces the skeleton on successful load

#### Scenario: Group detail skeleton renders while loading

- **WHEN** a user navigates to `/groups/:id`
- **THEN** a skeleton card placeholder is shown while `useGroupQuery` fetches

### Requirement: Create and Edit group forms are i18n-aware

The Create Group and Edit Group forms SHALL use i18n translation keys for all static text: labels, placeholders, buttons, validation messages, and success/error notifications. Translation keys SHALL be added to all existing locale files (en, es, fr, de, pt).

#### Scenario: Form text translates correctly

- **WHEN** the user's language is set to a non-English locale
- **THEN** create/edit form labels, buttons, and messages appear in that language

### Requirement: React Query mutations exist for group operations

The system SHALL provide React Query mutation hooks in `apps/web/src/app/_hooks/groups.ts`:
- `useCreateGroup()` — calls `POST /v1/groups`, invalidates groups list on success
- `useUpdateGroup(id)` — calls `PATCH /v1/groups/:id`, invalidates group detail and list
- `useDeleteGroup(id)` — calls `DELETE /v1/groups/:id`, invalidates groups list
- `useAddRecipeToGroup()` — calls `POST /v1/groups/:id/recipes`, invalidates group detail
- `useRemoveRecipeFromGroup()` — calls `POST /v1/groups/:id/remove-recipe`, invalidates group detail

#### Scenario: Mutation invalidates queries

- **WHEN** any group mutation succeeds
- **THEN** the relevant group queries are invalidated and refetch automatically
