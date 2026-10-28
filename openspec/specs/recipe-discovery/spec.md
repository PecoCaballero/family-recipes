# recipe-discovery Specification

## Purpose

TBD - created by archiving change whatsapp-list-ux. Update Purpose after archive.

## Requirements

### Requirement: Recipes tab defaults to own and saved recipes

The Recipes tab SHALL default to showing the union of the user's own recipes
and their saved recipes. It SHALL provide chip filters to toggle between "My
Recipes" and "Saved"; selecting a chip SHALL narrow the list to that subset, and
deselecting SHALL return to the combined view. The tab SHALL NOT show every
recipe visible to the user by default.

#### Scenario: Default view is own plus saved

- **WHEN** a user opens the Recipes tab without a chip selected
- **THEN** the list shows recipes that are authored by the user OR saved by the
  user, and does not include unrelated public or group recipes

#### Scenario: Toggle to My Recipes

- **WHEN** the user selects the "My Recipes" chip
- **THEN** only recipes authored by the user are shown

#### Scenario: Toggle to Saved

- **WHEN** the user selects the "Saved" chip
- **THEN** only recipes the user has saved are shown

#### Scenario: Deselect returns to combined view

- **WHEN** the user deselects the active chip
- **THEN** the combined own-plus-saved view is shown again

### Requirement: Group detail supports recipe search

The group detail page SHALL provide a search input that filters the group's
recipes by title and description, case-insensitively, over the already-loaded
group recipes. Clearing the query SHALL restore the full list.

#### Scenario: Filter group recipes by title

- **WHEN** a user types part of a recipe title in the group search
- **THEN** only group recipes whose title matches are shown

#### Scenario: Filter group recipes by description

- **WHEN** a user types text that appears only in a recipe's description
- **THEN** that recipe is included in the filtered results

#### Scenario: Clearing restores the list

- **WHEN** the user clears the group search input
- **THEN** all of the group's recipes are shown again

### Requirement: Search tab shows recent recipes when idle

When the Search tab has no active query, it SHALL show recently viewed recipes
as cards, persisted across sessions. If there is no recent history, it SHALL
show an empty state. While idle it SHALL NOT fetch or render the full recipe
list. When a query is entered, it SHALL show search results.

#### Scenario: Idle with history

- **WHEN** a user opens the Search tab with no query after previously viewing
  recipes
- **THEN** recently viewed recipes are shown as cards

#### Scenario: Idle without history

- **WHEN** a user opens the Search tab with no query and no recent history
- **THEN** an empty state is shown instead of a recipe list

#### Scenario: Idle does not fetch all recipes

- **WHEN** the Search tab is idle (empty query)
- **THEN** the app does not request or display the full visible-recipe list

#### Scenario: Query shows results

- **WHEN** the user types a query in the Search tab
- **THEN** matching recipes are shown as result cards

### Requirement: Branded search field

The search input SHALL render as a rounded surface that integrates with the
branded header in both light and dark modes, with sufficient contrast against
the header background.

#### Scenario: Search field on the branded header

- **WHEN** the search input is rendered inside the header
- **THEN** its surface is a rounded, readable field (not a flat dark-bordered
  box) that contrasts with the header background in both modes
