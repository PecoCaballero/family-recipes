## ADDED Requirements

### Requirement: All locales have identical key sets

The web app SHALL ship five locales (en, es, fr, de, pt) with identical
translation key sets, so no key falls back to English due to a missing
translation.

#### Scenario: Locale parity

- **WHEN** the locale files are compared
- **THEN** every locale contains exactly the same set of keys as `en`

#### Scenario: Parity regression is caught

- **WHEN** a key is added or removed in any locale but not the others
- **THEN** the locale-parity test fails

### Requirement: German is selectable

The web app SHALL list every available locale — including German — in the
language picker, and selecting one SHALL apply that locale.

#### Scenario: German appears in the picker

- **WHEN** a user opens the language setting
- **THEN** German (de) is listed alongside en, es, fr, and pt

#### Scenario: Selecting German applies it

- **WHEN** the user selects German
- **THEN** the UI renders German strings and the choice persists

### Requirement: UI strings are internationalized

The web app SHALL NOT present hardcoded English product strings. User-facing
text in auth, recipe form, ingredients list, not-found, and error screens SHALL
come from the i18n catalog with keys present in all locales.

#### Scenario: No hardcoded product strings

- **WHEN** the app renders in a non-English locale
- **THEN** auth messages, recipe-form placeholders/helper text, the 404 page,
  and error-screen fallbacks are translated

#### Scenario: Duplicate keys removed

- **WHEN** the locale JSON is parsed
- **THEN** no duplicate keys exist within a locale object
