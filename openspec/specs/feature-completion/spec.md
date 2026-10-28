## Purpose

TBD — In-app invitation UI, remove-from-group UI, global toast notifications, and resolution of non-functional settings.

## Requirements

### Requirement: Group admins can create invitations in-app

The group settings UI SHALL let an admin create an invitation for an email
address using the existing invitation API, and SHALL reflect success or failure
via the toast system.

#### Scenario: Admin invites a member by email

- **WHEN** a group admin enters an email in the invite control and confirms
- **THEN** the app calls the invitation API and shows a success toast
- **THEN** on failure the app shows an error toast and no invitation is created

### Requirement: Members can remove a recipe from a group

The group recipe view SHALL let an authorized member remove a recipe from the
group using the existing remove-from-group API, with a confirmation step.

#### Scenario: Remove recipe from group

- **WHEN** a user with permission removes a recipe from a group and confirms
- **THEN** the app calls the remove-from-group API and the recipe disappears
  from the group feed
- **THEN** a success toast is shown

### Requirement: Global toast notifications

The web app SHALL provide an app-wide toast/snackbar mechanism exposed to
components, and SHALL NOT use `window.alert` for user feedback.

#### Scenario: Action feedback via toast

- **WHEN** a user completes an action that requires feedback (e.g. share,
  invite, remove, error)
- **THEN** a toast is shown and no blocking `window.alert` is used

### Requirement: Settings presented as configurable have effect

Any setting presented as configurable SHALL have an observable effect, or SHALL
be hidden.

#### Scenario: Notification preference affects toasts

- **WHEN** the user disables notifications and an action emits feedback
- **THEN** non-error toasts are suppressed (errors still shown)

#### Scenario: No-op settings are hidden

- **WHEN** a setting has no implemented effect
- **THEN** it is not shown in the settings UI
