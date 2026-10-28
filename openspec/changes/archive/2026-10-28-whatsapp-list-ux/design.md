## Context

`GroupList.tsx` and `RecipeList.tsx` currently render MUI card grids (one `Grid`
per item). `(root)/groups/page.tsx` composes Header + SearchInput + GroupList +
InvitationBanner + FAB; `(root)/recipes/page.tsx` mirrors it; `(root)/groups/[id]/page.tsx`
renders group recipes with a member `ChipFilter` and a bulk-share FAB.
`ContentSkeleton` supports `card | form | list | text` variants; `EmptyState`
has `EmptyGroupState` / `EmptyRecipeState`. This change builds on
`whatsapp-design-system` tokens and does not alter routes or data flow.

## Goals / Non-Goals

**Goals:**

- Familiar list/feed rendering across groups, recipes, and group detail.
- Consistent row anatomy: leading avatar/image, bold title, secondary preview,
  trailing timestamp.
- Aligned skeletons and empty states.

**Non-Goals:**

- No new data fields beyond what the API already returns (use available
  counts/timestamps; if a value is missing, degrade gracefully — no API change
  here).
- No realtime, unread counts, or message threads.
- No navigation/tab restructuring.

## Decisions

**D1. Extract a reusable `ListRow` primitive.**
Add a small presentational component (leading visual, primary, secondary,
trailing) used by groups, recipes, and invitations. Alternative: restyle each
list independently — rejected (inconsistency, duplicated styling).

**D2. Rows over cards for groups; bubble cards for recipes.**
Groups map cleanly to conversations (rows). Recipes are content items → bubble
cards. Both use tokenized surfaces. Alternative: all rows — rejected, recipes
benefit from an image-forward card.

**D3. Preview data from existing payloads.**
Use member/recipe counts or `lastUpdated` already returned by the groups/recipes
queries. If a timestamp is absent, omit the trailing slot rather than inventing
data. Any required field gap is noted as a follow-up, not solved here.

**D4. Skeletons shaped as rows/cards.**
Extend `ContentSkeleton` with a `rows`/`feed` shape (or configure `list`) to
match the new row anatomy. Alternative: keep generic card skeleton — rejected
(mismatch causes perceived layout shift).

**D5. Invitations stay above the list.**
Keep `InvitationBanner` but restyle as a prominent tappable row; processing
already exists in `useAcceptInvitation`.

**D6. Recipes-tab scope defaults to own + saved.**
`useRecipesQuery` returns the union of visible recipes (author, public, group).
The Recipes tab currently renders all of them when no chip is active. Change the
default so the tab filters to `isAuthor || isSaved`; the "My Recipes"/"Saved"
chips narrow further, and deselecting restores the union. No API change — filter
the already-fetched payload, or add a query param later if the list grows.

**D7. In-group search is a client-side filter.**
`useGroupQuery` already returns all of the group's recipes (no pagination), so
filter in-memory by title/description (case-insensitive) with a `useMemo` over
the search term. Alternative: API `?search=` — rejected as unnecessary round
trips while there is no pagination.

**D8. Recent-recipe history via localStorage.**
Add `_hooks/useRecentRecipes.ts` storing a small, de-duplicated list of
`{ id, name, image }` (cap ~10) in `localStorage`, written when a recipe detail
page is viewed. The Search tab reads it when idle; empty → `EmptyRecipeState`.
When idle, do not call `useRecipesQuery` (pass `enabled` false / skip), so no
full-list fetch happens.

**D9. Search field is a themed surface, not a bare TextField.**
Restyle `SearchInput` to a rounded surface (tokenized radius + `background.paper`
/ soft fill) with a subtle border and contrast against the brand header in both
modes. Keep it a `TextField` for a11y/labels; adjust via `sx`/`slotProps`.

**D10. Spacing belongs to the list primitives, not the pages.**
Apply the ≥8px vertical gap in `ListRow`/`RecipeList` (a `Stack spacing`) and
give `ChipFilter` vertical margins plus a horizontally scrollable row, so pages
stay layout-agnostic.

## Risks / Trade-offs

- **Changing the Recipes-tab default could hide recipes users expect** → the
  chips remain the escape hatch; the combined default always includes own+saved.
- **localStorage history can go stale** (deleted recipes) → render defensively;
  a tap that 404s falls back to the empty/not-found state.
- **Long names / missing previews squeeze the row** → allow title ellipsis and
  drop the secondary line gracefully.
- **Timestamps require a field the query may not return** → verify hooks;
  degrade gracefully rather than adding an API dependency in this change.
- **Two list primitives must react to the same tokens** → centralize in
  `ListRow` to avoid drift.
- **Cross-change conflict with design-system** → sequence this change after it
  (done).

## Migration Plan

1. Add `ListRow` primitive using design tokens; apply ≥8px spacing.
2. Convert `GroupList` to rows; restyle `InvitationBanner` to match.
3. Convert `RecipeList` and the group-detail feed to bubble cards.
4. Update skeletons/empty states.
5. Recipes-tab default scope (own + saved) with toggles.
6. In-group recipe search (client-side).
7. Search-tab recent history + idle empty state; stop idle full-list fetch.
8. Restyle `SearchInput`; fix `ChipFilter` spacing/overflow.
9. `yarn verify`.

Rollback: revert the change; no data or API impact.

## Open Questions

- Is a meaningful "last activity" timestamp available from the groups query? If
  not, the trailing slot may show recipe count instead. (Resolve during
  implementation by inspecting `_hooks/groups.ts` / `_hooks/recipes.ts`.)
- Recent-history cap and fields (`{id, name, image}`) — default cap 10.
