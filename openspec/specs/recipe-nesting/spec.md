# recipe-nesting Specification

## Purpose

TBD - created by archiving change recipe-nesting. Update Purpose after archive.

## Requirements

### Requirement: Author can base a recipe on an existing recipe

The recipe form SHALL provide an optional "Based on" picker that lets the author
select an existing recipe as the parent. When a parent is chosen, the created or
updated recipe SHALL record it as `parentRecipeId`. When no parent is chosen,
the recipe SHALL be created without a parent.

#### Scenario: Create a variation

- **WHEN** an author creates a recipe and selects a parent recipe in "Based on"
- **THEN** the created recipe is stored with that `parentRecipeId`

#### Scenario: Create without a parent

- **WHEN** an author creates a recipe without selecting a parent
- **THEN** the recipe is created successfully with no parent

#### Scenario: Change the parent while editing

- **WHEN** the author edits a recipe and selects a different parent
- **THEN** the recipe's `parentRecipeId` is updated to the new value

#### Scenario: Picker excludes the recipe itself

- **WHEN** the author edits a recipe and opens the "Based on" picker
- **THEN** the recipe being edited is not offered as a parent

### Requirement: Recipe detail shows parent and variations

The recipe detail page SHALL show a link to the parent recipe when one exists,
and SHALL show a "Variations" section listing child recipes (variations) when
any exist.

#### Scenario: Recipe with a parent

- **WHEN** a user opens a recipe that has a parent
- **THEN** a link to the parent recipe is shown, and tapping it opens the parent

#### Scenario: Recipe with variations

- **WHEN** a user opens a recipe that has one or more child recipes
- **THEN** a "Variations" section lists those child recipes with their names, and
  tapping one opens it

#### Scenario: Recipe without nesting

- **WHEN** a user opens a recipe with no parent and no variations
- **THEN** no parent link or variations section is shown

### Requirement: Recipe responses include nesting summaries

The recipe API response SHALL include `parentRecipe` (an `{ id, name }` summary
or absent) and `nestedRecipes` (an array of `{ id, name }` summaries of child
recipes), so the client can render nesting without additional lookups.

#### Scenario: Detail response includes nesting

- **WHEN** a client requests a recipe that has a parent and/or children
- **THEN** the response includes `parentRecipe` and/or `nestedRecipes`
  summaries with `id` and `name`

### Requirement: Nesting input is validated

Selecting a parent that does not exist SHALL return a validation error rather
than a server error, and a recipe SHALL NOT be allowed to reference itself as
its parent.

#### Scenario: Non-existent parent

- **WHEN** a client submits a recipe with a `parentRecipeId` that does not exist
- **THEN** the API returns a 400 error with
  `{ error: 'validation_error', details: [...] }`

#### Scenario: Self-parent rejected

- **WHEN** a client submits an update setting `parentRecipeId` to the recipe's
  own id
- **THEN** the API returns a 400 validation error
