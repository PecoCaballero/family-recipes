## Purpose

TBD — Frontend UI for groups including create, edit, delete pages, recipe sharing drawer integration, skeleton loading states, i18n support, and React Query mutation hooks for group operations.

## Requirements

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

The system SHALL provide a delete action on the group settings page (`/groups/:id/settings`), visible only to admins. When clicked, a confirmation dialog SHALL appear. On confirmation, the system SHALL call `DELETE /v1/groups/:id`. The server SHALL enforce that the admin is the last and only member before allowing deletion. On success, the user SHALL be redirected to the groups list. The delete action SHALL only be visible when `isAdmin` is true.

#### Scenario: Admin deletes a group as last member

- **WHEN** the admin is the only remaining member, navigates to settings, clicks delete, and confirms the dialog
- **THEN** the system calls `DELETE /v1/groups/:id`
- **THEN** on 204 response, the user is redirected to `/groups`

#### Scenario: Admin cannot delete group with other members

- **WHEN** the admin clicks delete on settings but other members still exist in the group
- **THEN** the server returns a 400 error with `{ error: 'group_has_other_members' }`
- **THEN** the UI displays the error message

#### Scenario: Non-admin does not see delete action

- **WHEN** a non-admin views the settings page
- **THEN** the delete action is not visible

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

### Requirement: Group detail page links to settings instead of showing edit/delete

The group detail page (`/groups/:id/page.tsx`) SHALL replace the inline edit and delete buttons with a settings navigation action. When `isAdmin` is true, a settings icon or button SHALL appear in the page header (via `endSlot` prop). Clicking it SHALL navigate to `/groups/:id/settings`. Non-admin members SHALL also see the settings button to access the member list and quit functionality. The settings button SHALL be visible to all group members.

#### Scenario: Admin sees settings button on detail page

- **WHEN** a group admin views the group detail page
- **THEN** a settings icon/button is visible in the header
- **THEN** clicking navigates to `/groups/:id/settings`

#### Scenario: Non-admin member sees settings button on detail page

- **WHEN** a non-admin group member views the group detail page
- **THEN** a settings icon/button is visible in the header
- **THEN** clicking navigates to `/groups/:id/settings`

#### Scenario: Edit and delete buttons no longer appear on detail page

- **WHEN** any user views the group detail page
- **THEN** the inline edit and delete buttons are not rendered
- **THEN** these actions are only available on the settings page

### Requirement: FAB appears on groups list page

The groups list page (`/groups/page.tsx`) SHALL render a `<FloatingActionButton />` with an add/plus icon. The FAB SHALL navigate to `/groups/create`. The button SHALL include a tooltip using the i18n key `groups.fabCreateTooltip`.

#### Scenario: FAB navigates to create group

- **WHEN** an authenticated user views `/groups` and clicks the FAB
- **THEN** the user is navigated to `/groups/create`

### Requirement: FAB appears on recipes list page

The recipes list page (`/recipes/page.tsx`) SHALL render a `<FloatingActionButton />` with an add/plus icon. The FAB SHALL navigate to `/recipes/create`. The button SHALL include a tooltip using the i18n key `recipes.fabCreateTooltip`.

#### Scenario: FAB navigates to create recipe

- **WHEN** an authenticated user views `/recipes` and clicks the FAB
- **THEN** the user is navigated to `/recipes/create`

### Requirement: Group settings page skeleton loads while fetching

The group settings page SHALL display a `<ContentSkeleton variant="card" />` while the group data is being fetched via `useGroupQuery`. The skeleton SHALL be replaced by real content on successful load.

#### Scenario: Settings page shows skeleton on mount

- **WHEN** a member navigates to `/groups/:id/settings`
- **THEN** a `<ContentSkeleton variant="card" />` is shown while the query fetches
- **THEN** real content replaces the skeleton on successful load

### Requirement: Quit group mutation hook exists

The system SHALL provide a `useQuitGroup(groupId)` React Query mutation hook in `apps/web/src/app/_hooks/groups.ts`. The hook SHALL call `POST /v1/groups/:id/quit`. On success, it SHALL invalidate the groups list query and navigate to `/groups`.

#### Scenario: Quit mutation invalidates queries

- **WHEN** the quit group mutation succeeds
- **THEN** the groups list query is invalidated and refetches
- **THEN** the user is redirected to `/groups`

### Requirement: Group detail page has a FAB for bulk recipe sharing

The system SHALL render a `<FloatingActionButton />` on the group detail page (`/groups/:id`) for all group members. The FAB SHALL display a share/add-recipe icon and include a tooltip via i18n key `groups.fabShareTooltip`. Clicking the FAB SHALL open the `BulkShareDialog` component.

#### Scenario: Group member sees share FAB

- **WHEN** a group member navigates to `/groups/:id`
- **THEN** a FAB with share icon is rendered at the bottom-right
- **THEN** hovering shows the tooltip text

#### Scenario: FAB navigates to open BulkShareDialog

- **WHEN** a group member clicks the share FAB
- **THEN** the BulkShareDialog opens as a modal

### Requirement: BulkShareDialog loads user's unshared recipes

The system SHALL provide a `BulkShareDialog` component that fetches the current user's recipes via `useRecipesQuery()` and the group's detail via `useGroupQuery(id)`. The dialog SHALL filter out recipes whose IDs are already in the group's `recipeIds` array. Filtered recipes SHALL be displayed as selectable cards with checkboxes. The dialog SHALL show a loading skeleton while data fetches. The user SHALL be able to select one or more recipes and confirm sharing. On confirm, the dialog SHALL call `POST /v1/groups/:id/recipes/batch`. On success, the dialog SHALL close and the group queries SHALL invalidate.

#### Scenario: Dialog loads and filters unshared recipes

- **WHEN** the BulkShareDialog opens for a group
- **THEN** the dialog displays a loading skeleton while queries fetch
- **THEN** recipes already shared to the group are filtered out
- **THEN** only unshared recipes are shown as selectable cards

#### Scenario: User selects recipes and shares

- **WHEN** the user selects 3 recipe cards and clicks the confirm button
- **THEN** the confirm button shows a loading state and is disabled
- **THEN** the dialog calls `POST /v1/groups/:id/recipes/batch` with the selected IDs
- **THEN** on success, the dialog closes and group queries invalidate

#### Scenario: User has no unshared recipes

- **WHEN** the BulkShareDialog opens but all user-authored recipes are already shared
- **THEN** an empty state message is displayed using i18n key `groups.bulkShareEmpty`

#### Scenario: Dialog can be cancelled

- **WHEN** the user opens the BulkShareDialog and clicks cancel or outside the dialog
- **THEN** the dialog closes without making any API calls

### Requirement: Mutation hooks exist for new operations

The system SHALL provide React Query mutation hooks in `apps/web/src/app/_hooks/groups.ts`:
- `useAddAdmin(groupId)` — calls `POST /v1/groups/:id/admins`, invalidates group detail
- `useRemoveAdmin(groupId)` — calls `DELETE /v1/groups/:id/admins/:userId`, invalidates group detail
- `useBatchAddRecipes(groupId)` — calls `POST /v1/groups/:id/recipes/batch`, invalidates group detail
- `useCreateInvitation(groupId)` — calls `POST /v1/groups/:id/invitations`, invalidates groups list
- `useAcceptInvitation(groupId)` — calls `POST /v1/groups/:id/invitations/:invitationId/accept`, invalidates groups list

#### Scenario: Mutation invalidates queries on success

- **WHEN** any of the new mutations succeeds
- **THEN** the relevant group queries are invalidated and refetch automatically

### Requirement: Invitation banner appears on groups list page

The system SHALL display a call-to-action banner on the groups list page (`/groups`) when the authenticated user has pending invitations. The banner SHALL show the group name, inviter name, and an "Accept" button. Clicking "Accept" SHALL call the accept invitation mutation and refresh the groups list.

#### Scenario: User sees invitation banner

- **WHEN** an authenticated user with pending invitations navigates to `/groups`
- **THEN** a banner is shown for each pending invitation listing group name and inviter
- **THEN** each banner has an "Accept" button

#### Scenario: User accepts invitation from banner

- **WHEN** the user clicks "Accept" on an invitation banner
- **THEN** the accept invitation mutation is called
- **THEN** on success, the banner disappears and the groups list refreshes

#### Scenario: No banner when no invitations exist

- **WHEN** an authenticated user with no pending invitations navigates to `/groups`
- **THEN** no invitation banner is displayed
