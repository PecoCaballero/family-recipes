## ADDED Requirements

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
