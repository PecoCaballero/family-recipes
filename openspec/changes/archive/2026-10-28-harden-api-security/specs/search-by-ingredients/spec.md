## MODIFIED Requirements

### Requirement: Suggestions are scored against the pantry

The system SHALL score each recipe visible to the user by how many of its
ingredient names are covered by the user's pantry, using case-insensitive
equality of normalized names (trimmed, lowercased). A pantry item covers an
ingredient only when the normalized names are equal. Substring and partial
matches (e.g. `egg` matching `eggplant`, or `milk` matching `chocolate milk`)
SHALL NOT count as coverage. A recipe whose ingredients are all covered SHALL
be marked `canMake`. A recipe with one or two missing ingredients SHALL be
marked `almost` and SHALL include the names of the missing ingredients. A recipe
with more than two missing ingredients SHALL be omitted.

#### Scenario: Fully covered recipe can be made

- **WHEN** a user's pantry covers every ingredient name of a recipe
- **THEN** the suggestion is marked `canMake` with `missingCount` 0

#### Scenario: Equality is case-insensitive

- **WHEN** a user's pantry contains `Onion` and a recipe ingredient is `onion`
- **THEN** the pantry item covers the ingredient

#### Scenario: Substring or partial match does not cover

- **WHEN** a user's pantry contains `egg` and a recipe ingredient is `eggplant`
- **THEN** `egg` does NOT cover `eggplant`, and `eggplant` is reported missing

#### Scenario: Compound names are not covered by their parts

- **WHEN** a user's pantry contains `milk` and a recipe ingredient is
  `chocolate milk`
- **THEN** `milk` does NOT cover `chocolate milk`, and it is reported missing

#### Scenario: Recipe missing one ingredient is "almost"

- **WHEN** a recipe has exactly one ingredient name not covered by the pantry
- **THEN** the suggestion is marked `almost` with `missingCount` 1 and
  `missingIngredients` containing that name

#### Scenario: Recipe missing more than two ingredients is omitted

- **WHEN** a recipe has three or more ingredient names not covered by the pantry
- **THEN** the recipe is not returned in the suggestions

#### Scenario: Suggestions are sorted best-first

- **WHEN** the system returns suggestions
- **THEN** `canMake` suggestions come before `almost` suggestions, and within
  each group suggestions are ordered by `missingCount` ascending
