## 1. List row primitive

- [x] 1.1 Create a reusable `ListRow` component (leading visual, title, secondary, trailing) using design tokens (web)

## 2. Groups list

- [x] 2.1 Convert `GroupList` to chat-style rows with avatar, name, preview, and timestamp (web)
- [x] 2.2 Restyle `InvitationBanner` as a prominent tappable row above the list (web)
- [x] 2.3 Ensure the full row is tappable and navigates to the group (web)

## 3. Recipes list and group feed

- [x] 3.1 Convert `RecipeList` to message-style bubble cards (web)
- [x] 3.2 Render the group detail recipes as a bubble-card feed with the share FAB (web)

## 4. States

- [x] 4.1 Extend `ContentSkeleton` with a rows/feed shape matching the row anatomy (web)
- [x] 4.2 Update `EmptyState` copy/CTAs to explain the next action (web)

## 5. Recipes tab scope

- [x] 5.1 Default the Recipes tab to own + saved recipes (filter by `isAuthor || isSaved`) (web)
- [x] 5.2 Make "My Recipes" and "Saved" chips toggle the subset and restore the combined view on deselect (web)

## 6. In-group recipe search

- [x] 6.1 Add a search input to the group detail page filtering recipes by title/description (client-side) (web)
- [x] 6.2 Show an empty state when the group search yields no matches (web)

## 7. Search tab history

- [x] 7.1 Add `_hooks/useRecentRecipes.ts` persisting recent recipes in `localStorage` (cap ~10) (web)
- [x] 7.2 Record a recipe as recently viewed when its detail page is opened (web)
- [x] 7.3 Search tab idle: show recent recipe cards, empty state when none, and skip fetching all recipes (web)

## 8. Search field and chips

- [x] 8.1 Restyle `SearchInput` as a rounded branded surface readable in light and dark modes (web)
- [x] 8.2 Add vertical spacing and horizontal scroll-with-gaps to `ChipFilter` (web)

## 9. Spacing

- [x] 9.1 Enforce ≥8px vertical spacing between list items in `ListRow`/`RecipeList` (web)

## 10. Tests

- [x] 10.1 Add tests for row rendering (title, preview, tap navigation) and recipe card rendering (web)
- [x] 10.2 Add tests for Recipes-tab default scope, group search filtering, and recent-history idle/empty behavior (web)

## 11. Verify

- [x] 11.1 Run `yarn verify` (web)
