## Purpose

TBD — Reusable FloatingActionButton component providing consistent, themed navigation across list pages (groups, recipes) without overlapping the bottom navigation bar.

## Requirements

### Requirement: Reusable FloatingActionButton component exists

The system SHALL provide a reusable `<FloatingActionButton />` component at `apps/web/src/app/_components/FloatingActionButton.tsx`. The component SHALL accept `icon` (ReactNode), `href` (string, Next.js route), and optional `label` (string, for aria-label/tooltip) props. The button SHALL be positioned fixed at the bottom-right of the viewport with appropriate z-index and margin to not overlap the BottomNavigation bar. The component SHALL use MUI's `Fab` component and be theme-aware (dark mode compatible). The button SHALL include a tooltip on hover showing the `label` text.

#### Scenario: FAB renders with icon and navigation

- **WHEN** a FAB with `icon={<Add />}`, `href="/groups/create"`, and `label="Create Group"` is mounted
- **THEN** the button appears fixed at the bottom-right of the screen
- **THEN** clicking navigates to `/groups/create`
- **THEN** hovering shows a tooltip with "Create Group"

#### Scenario: FAB does not overlap BottomNavigation

- **WHEN** the FAB is rendered on a page with BottomNavigation
- **THEN** the FAB is positioned above the BottomNavigation bar with sufficient spacing
- **THEN** the FAB does not obscure any navigation items

#### Scenario: FAB theme-aware rendering

- **WHEN** the app is in dark mode
- **THEN** the FAB uses the dark theme's primary color
- **WHEN** the app is in light mode
- **THEN** the FAB uses the light theme's primary color

### Requirement: FAB on groups list page navigates to create group

The system SHALL render a FloatingActionButton on the groups list page (`/groups/page.tsx`). The button SHALL use a "plus" or "add" icon and SHALL navigate to `/groups/create`. The button SHALL include a tooltip reading "Create Group" (i18n key `groups.fabCreateTooltip`).

#### Scenario: User clicks FAB on groups page

- **WHEN** an authenticated user views `/groups` and clicks the FAB
- **THEN** the user is navigated to `/groups/create`

### Requirement: FAB on recipes list page navigates to create recipe

The system SHALL render a FloatingActionButton on the recipes list page (`/recipes/page.tsx`). The button SHALL use a "plus" or "add" icon and SHALL navigate to `/recipes/create`. The button SHALL include a tooltip reading "Create Recipe" (i18n key `recipes.fabCreateTooltip`).

#### Scenario: User clicks FAB on recipes page

- **WHEN** an authenticated user views `/recipes` and clicks the FAB
- **THEN** the user is navigated to `/recipes/create`
