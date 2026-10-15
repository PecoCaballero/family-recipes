# recipe-actions Specification

## Purpose
TBD - created by archiving change recipe-actions-wiring. Update Purpose after archive.
## Requirements
### Requirement: User can save and unsave a recipe from the recipe menu

The recipe detail menu SHALL expose a save/unsave toggle. When the recipe is not saved, the item SHALL read "Save recipe" and selecting it SHALL call `POST /v1/recipes/:id/save`. When the recipe is saved, the item SHALL read "Unsave recipe" and selecting it SHALL call `POST /v1/recipes/:id/unsave`. The menu SHALL close after selection, and the recipe's saved state SHALL reflect the updated recipe data.

#### Scenario: Save an unsaved recipe

- **WHEN** a user opens the recipe menu for a recipe where `isSaved` is false and selects "Save recipe"
- **THEN** the app calls `POST /v1/recipes/:id/save`
- **THEN** the menu closes and the recipe's `isSaved` becomes true after refresh

#### Scenario: Unsave a saved recipe

- **WHEN** a user opens the recipe menu for a recipe where `isSaved` is true and selects "Unsave recipe"
- **THEN** the app calls `POST /v1/recipes/:id/unsave`
- **THEN** the menu closes and the recipe's `isSaved` becomes false after refresh

### Requirement: Recipe author can delete a recipe from the recipe menu

The recipe detail menu SHALL show a "Delete recipe" item only to the recipe author. Selecting it SHALL open a confirmation dialog. On confirmation, the app SHALL call `DELETE /v1/recipes/:id` and redirect to `/recipes` on success. Cancelling SHALL close the dialog without deleting.

#### Scenario: Author deletes recipe after confirming

- **WHEN** the recipe author selects "Delete recipe" and confirms the dialog
- **THEN** the app calls `DELETE /v1/recipes/:id`
- **THEN** on success the app redirects to `/recipes`

#### Scenario: Author cancels deletion

- **WHEN** the recipe author selects "Delete recipe" and cancels the dialog
- **THEN** no request is sent and the recipe is unchanged

#### Scenario: Non-author does not see delete item

- **WHEN** a user who is not the recipe author opens the recipe menu
- **THEN** the "Delete recipe" item is not shown

### Requirement: User can share a recipe via the device share sheet

The recipe detail menu SHALL expose a "Share" item. Selecting it SHALL invoke the Web Share API (`navigator.share`) when available, sharing the recipe name and current URL. When the Web Share API is unavailable, the app SHALL fall back to copying the recipe URL to the clipboard.

#### Scenario: Share with Web Share API available

- **WHEN** a user selects "Share" and `navigator.share` is available
- **THEN** the app invokes `navigator.share` with the recipe name and current URL

#### Scenario: Share falls back to clipboard when Web Share API unavailable

- **WHEN** a user selects "Share" and `navigator.share` is not available
- **THEN** the app copies the recipe URL to the clipboard

