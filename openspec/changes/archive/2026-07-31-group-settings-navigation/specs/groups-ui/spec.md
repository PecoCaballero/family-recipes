## MODIFIED Requirements

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

## ADDED Requirements

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
