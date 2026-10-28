## ADDED Requirements

### Requirement: Central design tokens drive the theme

The web app SHALL define a single source of design tokens (color, typography
scale, spacing, radii, minimum touch-target size) and SHALL derive the MUI theme
from those tokens for both light and dark modes, rather than using MUI defaults
inline.

#### Scenario: Theme derives from tokens

- **WHEN** the theme is created for light or dark mode
- **THEN** palette, typography, and component overrides are sourced from the
  shared token module, not hardcoded per component

#### Scenario: Dark mode parity

- **WHEN** the user selects light, dark, or auto theme
- **THEN** the app renders the tokenized palette for that mode with no
  unreadable contrast

### Requirement: WhatsApp green brand palette

The web app SHALL use the WhatsApp green family as its brand palette: a primary
accent near `#25D366`, header backgrounds in the `#075E54`–`#128C7E` range, and
conversation-style surface colors for light (`#ECE5DD`-family) and dark
(`#111B21`-family) modes.

#### Scenario: Primary accent is green

- **WHEN** a primary action (FAB, filled button, active tab) renders
- **THEN** its color is drawn from the green palette and not `#1976d2`

### Requirement: Typography and touch targets sized for older users

The web app SHALL size base body typography for comfortable reading by older
users and SHALL enforce a minimum interactive target height of 48px on primary
actions (navigation items, list rows, floating action button, dialog actions,
icon buttons).

#### Scenario: Minimum touch target

- **WHEN** any primary action is rendered
- **THEN** its interactive height is at least 48px

#### Scenario: Readable base type

- **WHEN** body text and list titles render
- **THEN** they use the enlarged tokenized type scale

### Requirement: Restyled shared components

The web app SHALL restyle its shared components — Header, BottomNavigation,
FloatingActionButton, dialogs, buttons, inputs, EmptyState, ContentSkeleton,
and error screens — to the brand tokens, with consistent rounded surfaces and
clear hierarchy.

#### Scenario: Components reflect brand

- **WHEN** any shared component renders
- **THEN** it uses tokenized colors, radii, and spacing rather than raw hex or
  MUI defaults

### Requirement: Brand assets and PWA metadata

The web app SHALL ship a logo, app icon, a valid web app manifest, and a
`theme-color`, and SHALL correctly render the configured typography (no font
mismatch between theme and layout).

#### Scenario: Manifest and icon present

- **WHEN** the app is loaded in a browser
- **THEN** a manifest with name, icons, and theme color is served and the
  selected font matches the theme's `fontFamily`

### Requirement: Single active styling approach

The web app SHALL have exactly one active styling approach. The unused Tailwind
install (no `globals.css`, no directives) SHALL be removed, or adopted
intentionally; MUI `sx` + design tokens SHALL remain the styling approach.

#### Scenario: No dead styling dependency

- **WHEN** the build runs
- **THEN** there is no installed-but-unwired styling toolchain in the web app
