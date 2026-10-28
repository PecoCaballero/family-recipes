# whatsapp-lists Specification

## Purpose

TBD - created by archiving change whatsapp-list-ux. Update Purpose after archive.

## Requirements

### Requirement: Groups render as chat-style rows

The groups list SHALL render each group as a full-width row resembling a
WhatsApp conversation: a leading avatar, a bold group name, a secondary preview
line (e.g. member count or last activity), and a trailing timestamp. The row's
entire surface SHALL be tappable and navigate to the group.

#### Scenario: Group row layout

- **WHEN** a user views the groups list
- **THEN** each group shows a leading avatar, bold name, secondary preview, and
  trailing timestamp in a single tappable row

#### Scenario: Row navigates to group

- **WHEN** a user taps any part of a group row
- **THEN** the app navigates to that group's detail page

### Requirement: Recipes render as message-style cards

The recipes list SHALL render each recipe as a message-bubble-style card with a
leading image or icon, a title, and a short preview, consistent with the
WhatsApp aesthetic defined by the design system.

#### Scenario: Recipe card layout

- **WHEN** a user views the recipes list
- **THEN** each recipe appears as a bubble card with a leading visual, title, and
  short preview

### Requirement: Group detail renders recipes as a feed

The group detail page SHALL render the group's recipes as a feed of bubble cards
using the same list styling, with the share/compose action available as a
familiar floating affordance.

#### Scenario: Group feed

- **WHEN** a user opens a group
- **THEN** the group's recipes appear as a feed of bubble cards, and the
  share-recipe action is reachable from a floating action button

### Requirement: Pending invitations are prominent rows

Pending invitations SHALL render as tappable rows consistent with the list
styling, positioned prominently (above the list), so a new member can accept
them without hunting.

#### Scenario: Invitation visible and actionable

- **WHEN** a user has a pending invitation
- **THEN** it appears above the groups list as a tappable row that can be
  accepted

### Requirement: Loading and empty states match the list style

The web app SHALL render loading skeletons shaped like the corresponding list
rows/cards and SHALL render empty states that explain the next action, using the
design-system tokens.

#### Scenario: List loading skeleton

- **WHEN** the groups or recipes list is loading
- **THEN** skeletons shaped like list rows/cards are shown instead of a spinner
  alone

#### Scenario: Empty list guidance

- **WHEN** a list is empty
- **THEN** the empty state explains how to create or join the first item

### Requirement: List items have vertical spacing

The web app SHALL render at least 8px of vertical spacing between adjacent list
items (group rows and recipe cards) so items never touch.

#### Scenario: Groups are spaced

- **WHEN** a user views two or more groups in the groups list
- **THEN** there is at least 8px of vertical gap between consecutive group rows

#### Scenario: Recipes are spaced

- **WHEN** a user views two or more recipes in a list or group feed
- **THEN** there is at least 8px of vertical gap between consecutive recipe cards

### Requirement: Chip filters are spaced and scrollable

Chip filter rows SHALL have vertical spacing separating them from adjacent
content (at least 8px above and below) and SHALL scroll horizontally with gaps
of at least 8px between chips when they overflow their container.

#### Scenario: Chip filter does not touch neighbours

- **WHEN** a chip filter is rendered next to a search field or a list
- **THEN** it has at least 8px vertical spacing from the adjacent component

#### Scenario: Chip overflow scrolls

- **WHEN** the chips exceed the available width
- **THEN** the row scrolls horizontally with a gap between chips and is not
  clipped mid-chip
