# WhatsApp Design System

## Why

The app currently ships MUI defaults: primary `#1976d2`, secondary `#dc004e`
(`_theme/theme.ts`), no brand identity, a theme/typography font mismatch (theme
declares "Geist" but `layout.tsx` loads Inter), a dead Tailwind install, and
small default type/touch sizing. For older family members this reads as
generic and unpolished. A WhatsApp-familiar, branded design system gives the app
personality and instant recognizability.

## What Changes

- Introduce a central design-token layer (color, typography scale, spacing,
  radii, touch-target minimums) and wire the MUI theme to it for light and dark.
- Adopt the WhatsApp green palette (`#25D366` primary accent, `#075E54` /
  `#128C7E` headers, `#ECE5DD`/`#111B21` surfaces) with legible contrast in both
  modes.
- Increase base typography and control sizing for older users; enforce a 48px
  minimum touch target on primary actions.
- Restyle shared components: Header, BottomNavigation, FloatingActionButton,
  dialogs, buttons, inputs, EmptyState, ContentSkeleton, error screens.
- Add brand assets: logo, app icon, PWA manifest + `theme-color`.
- Clean up: fix the font mismatch (pick one font), remove the unused Tailwind
  install (or wire it intentionally), fix invalid `color="textSecondary"` usage.

## Capabilities

### New Capabilities

- `design-system`: Brand tokens, WhatsApp-familiar theme (light + dark),
  typography and touch-target sizing, restyled shared components, and brand/PWA
  assets.

### Modified Capabilities

<!-- None; visual styling is not a spec-level behavior change to existing specs. -->

## Impact

- **App**: `web` only.
- **Code**: `apps/web/src/app/_theme/`, `_providers/themeProvider.tsx`,
  `_components/*`, `apps/web/src/app/layout.tsx`, `apps/web/public/`,
  `next.config.mjs` (manifest), `package.json` (Tailwind removal if chosen).
- **No API/shared changes.**
- **Verification**: `yarn verify` (web lint/typecheck/test/build).
