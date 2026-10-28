# WhatsApp List UX & Recipe Discovery

## Why

The groups and recipes lists use card grids/rows that don't read like a familiar
messaging app, and a review of the running app surfaced concrete gaps: groups
have no vertical spacing between them, the Recipes tab shows _every_ visible
recipe instead of the user's own and saved ones, the Search tab renders all
recipes when nothing has been searched, there is no way to search recipes inside
a group, the search field clashes with the branded header, and chip filters sit
too close to their neighbours. Older users need familiar, uncluttered lists and
predictable discovery.

## What Changes

- Groups list becomes WhatsApp-style chat rows: leading avatar, bold group name,
  secondary preview (member/recipe count or last activity), trailing timestamp;
  rows have at least 8px vertical spacing.
- Recipes list becomes message-style cards (bubble surfaces) with leading
  image/icon, title, and short preview; cards have consistent vertical spacing.
- Group detail renders its recipes as a lightweight feed of bubble cards with
  the compose (share) affordance as a familiar floating action.
- Pending invitations render as prominent, tappable rows consistent with the
  list style.
- **Recipes tab defaults to the user's own and saved recipes**, with chips that
  toggle between "My Recipes" and "Saved" (deselecting returns to the combined
  view). No longer shows every visible recipe by default.
- **Group detail gains a recipe search** that filters the group's recipes by
  title/description client-side (no API change; the group already returns all
  its recipes).
- **Search tab shows recently viewed recipe cards** when idle (persisted across
  sessions); if there is no history it shows an empty state. It no longer
  fetches/renders all recipes when idle; typing a query shows results.
- **Search field restyled** to a rounded surface that integrates with the
  branded header in light and dark mode.
- **Chip filters get vertical spacing** from adjacent content and scroll
  horizontally with gaps when they overflow.
- Empty and loading states restyled to match (skeletons shaped like list rows).

## Capabilities

### New Capabilities

- `whatsapp-lists`: WhatsApp-familiar list/feed rendering for groups, recipes,
  and group recipe views (rows, bubble cards, previews, timestamps, list
  spacing, chip-filter spacing/overflow, aligned empty/loading states).
- `recipe-discovery`: Recipes-tab default scope (own + saved with toggles),
  in-group recipe search, Search-tab recent-recipe history with empty state, and
  the branded search field.

### Modified Capabilities

<!-- None at requirement level; routes and API contracts are unchanged. -->

## Impact

- **App**: `web` only.
- **Code**: `_components/GroupList.tsx`, `_components/RecipeList.tsx`,
  `_components/EmptyState.tsx`, `_components/ContentSkeleton.tsx`,
  `_components/ChipFilter.tsx`, `_components/SearchInput.tsx`,
  `_components/InvitationBanner.tsx`, `(root)/groups/page.tsx`,
  `(root)/groups/[id]/page.tsx`, `(root)/recipes/page.tsx`,
  `(root)/recipes/[id]/page.tsx`, `(root)/search/page.tsx`,
  `_hooks/useSearch.ts` (recent history), new `_hooks/useRecentRecipes.ts`.
- **Depends on**: `whatsapp-design-system` (tokens/theme) — implemented.
- **Verification**: `yarn verify` (web).
