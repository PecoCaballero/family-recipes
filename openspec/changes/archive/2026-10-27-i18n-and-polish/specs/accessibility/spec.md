## ADDED Requirements

### Requirement: Interactive controls are labeled

Every interactive control SHALL have an accessible name (visible label or
`aria-label`), including icon buttons for the recipe overflow menu, ingredient
edit/delete, avatar upload/remove, and navigation.

#### Scenario: Icon buttons have names

- **WHEN** a screen reader focuses any icon-only control
- **THEN** it announces a meaningful accessible name

### Requirement: Visible focus and skip link

The web app SHALL provide visible focus styling for keyboard navigation and a
skip-to-content link at the top of the page.

#### Scenario: Keyboard focus visible

- **WHEN** a user navigates with the keyboard
- **THEN** the focused element is visibly indicated

#### Scenario: Skip link present

- **WHEN** the page is loaded
- **THEN** a skip-to-content link is available as the first focusable element
