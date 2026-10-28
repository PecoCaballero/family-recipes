## 1. Design tokens

- [x] 1.1 Create `apps/web/src/app/_theme/tokens.ts` with colors, type scale, spacing, radii, and `MIN_TOUCH_TARGET` (web)
- [x] 1.2 Rebuild `_theme/theme.ts` to derive light + dark themes from tokens (web)
- [x] 1.3 Add global MUI component overrides (Button, IconButton, ListItemButton, Dialog, TextField) honoring min touch target (web)

## 2. Theme mode

- [x] 2.1 Persist theme choice in `localStorage` and keep `auto` following `prefers-color-scheme` (`_providers/themeContext.tsx`) (web)
- [x] 2.2 Align theme `fontFamily` with the loaded font variable in `layout.tsx` (web)

## 3. Component restyle

- [x] 3.1 Restyle `Header` and `BottomNavigation` to brand tokens (web)
- [x] 3.2 Restyle `FloatingActionButton`, `LoadingButton`, and buttons to brand tokens + min touch target (web)
- [x] 3.3 Restyle `EmptyState`, `ContentSkeleton`, `ConfirmDialog`, and other dialogs (web)
- [x] 3.4 Fix invalid `color="textSecondary"` usage and tokenize error-screen colors (web)

## 4. Assets and PWA

- [x] 4.1 Add `public/logo.svg` and app icons (web)
- [x] 4.2 Add `public/manifest.webmanifest` and wire `themeColor` + manifest in Next metadata (web)

## 5. Cleanup

- [x] 5.1 Remove Tailwind dependency, config, PostCSS wiring, and stray `antialiased` class (web)
- [x] 5.2 Add a render test asserting brand primary color and min touch target on a shared component (web)

## 6. Verify

- [x] 6.1 Run `yarn verify` and confirm light + dark rendering (web)
