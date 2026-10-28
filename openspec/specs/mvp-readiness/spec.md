# mvp-readiness Specification

## Purpose

TBD - created by archiving change mvp-launch. Update Purpose after archive.

## Requirements

### Requirement: WhatsApp-familiar visual language

The web app SHALL present a visual language intentionally close to WhatsApp so
that non-technical, older users can recognize and navigate it without
instruction. This SHALL include a green brand palette, chat-style list rows
(leading avatar, bold title, secondary preview line), message-bubble recipe
cards, and typography and touch targets sized for older users.

#### Scenario: Brand palette is applied

- **WHEN** the web app renders in light or dark mode
- **THEN** the primary interactive color is the WhatsApp green family
  (`#25D366` accents, `#075E54`/`#128C7E` headers) rather than the MUI default
  blue

#### Scenario: Lists use chat-style rows

- **WHEN** a user views the groups list
- **THEN** each group is shown as a full-width row with a leading avatar, a
  bold name, and a secondary preview line, resembling a WhatsApp chat list

#### Scenario: Touch targets are large enough

- **WHEN** any primary action (navigation tab, list row, floating action button,
  dialog action) is rendered
- **THEN** its interactive target is at least 48px tall

### Requirement: Core journey completable unaided

An older, non-technical family member SHALL be able to complete the core MVP
journey — register or sign in, join or create a group, and save or share a
recipe — without external guidance, using only visible, clearly labeled
controls.

#### Scenario: New user completes onboarding

- **WHEN** a new family member registers, opens the groups list, accepts a
  pending invitation, and saves a shared recipe
- **THEN** every step is reachable from visible, labeled controls with no dead
  ends

### Requirement: No deceptive stub UI

The system SHALL NOT present interactive UI for capabilities that are not
implemented. Any unfinished capability SHALL either be fully functional or be
removed/hidden behind no affordance.

#### Scenario: Sign-in options reflect reality

- **WHEN** a user opens the login screen
- **THEN** every sign-in option shown is fully functional (email/password and
  Google), and no button leads to a hardcoded "not available" message

#### Scenario: Settings toggles have effect

- **WHEN** a user changes a setting that is presented as configurable
  (notifications, privacy)
- **THEN** the setting has an observable effect, or the control is not shown
