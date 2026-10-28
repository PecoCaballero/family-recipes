## Context

The web app styles exclusively with MUI `sx` props (no CSS Modules, no active
Tailwind). Theme lives in `apps/web/src/app/_theme/theme.ts` and is rebuilt per
mode by `_providers/themeProvider.tsx` (`light | dark | auto` from
`themeContext.tsx`). Typography is declared as `"Geist"` in the theme but
`layout.tsx` loads Inter via `next/font/google` — a mismatch. `public/` holds
only default Next SVGs; there is no manifest or app icon. Known defects:
`EmptyState.tsx` uses invalid `color="textSecondary"`, error screens use raw hex
gradients, and `themeContext` persists to `sessionStorage` (not `localStorage`).

## Goals / Non-Goals

**Goals:**

- One token module consumed by the MUI theme; WhatsApp green, light + dark.
- Enlarged type scale and 48px minimum touch targets.
- Consistent restyle of all shared components.
- Brand logo/icon/manifest/theme-color.
- Remove dead styling machinery; fix font mismatch and invalid prop usage.

**Non-Goals:**

- No layout/navigation restructuring (that is `whatsapp-list-ux`).
- No new components or features.
- No custom illustration/artwork beyond a simple, legible logo.

## Decisions

**D1. Token module + `createTheme` factory.**
Add `_theme/tokens.ts` exporting colors, type scale, spacing, radii, and
`MIN_TOUCH_TARGET = 48`. `theme.ts` builds light/dark themes from tokens.
Alternative: keep inline palette values — rejected (drift, hard to audit
contrast).

**D2. Green palette, WhatsApp-derived.**
`primary.main ≈ #25D366` with darker `primary.dark` for contrast on light
surfaces; header uses `#075E54`/`#128C7E`; app background `#ECE5DD` (light) /
`#111B21` (dark). Ensure WCAG AA for text on these surfaces; adjust shade rather
than abandon the hue.

**D3. Font: keep the loaded font, fix the theme.**
Set the theme `fontFamily` to the actual loaded font (Inter) via its CSS
variable, instead of changing the loaded font. Alternative: switch theme to
Geist and load Geist — unnecessary churn.

**D4. Remove Tailwind.**
Delete `tailwind.config.ts`, `postcss.config.mjs`, the `tailwindcss` dependency,
and the stray `antialiased` class; MUI `sx` + tokens stay. Alternative: wire
Tailwind — rejected as a parallel styling system with no current use.

**D5. Assets.**
Add `public/logo.svg`, `public/icon-192.png`/`icon-512.png` (or SVG-based
manifest icons), `public/manifest.webmanifest`, and set `themeColor` via Next
metadata. Keep it simple and legible.

**D6. Harden the theme mode.**
Move theme persistence from `sessionStorage` to `localStorage` so the choice
survives reloads; keep `auto` following `prefers-color-scheme`.

## Risks / Trade-offs

- **Green-on-green contrast** (e.g. white text on `#25D366`) → use darker
  shades for text-bearing surfaces; verify in both modes.
- **Global restyle touches many components** → keep changes to token usage and
  overrides; avoid behavioral edits; cover with at least one render test.
- **PWA manifest expectations** → keep manifest minimal (name, short_name,
  start_url, display `standalone`, icons, theme/background color) to avoid
  scope creep.
- **Removing Tailwind may break the `antialiased` class usage** → replace with
  `CssBaseline` / MUI typography smoothing.

## Migration Plan

1. Add `tokens.ts` and rebuild `theme.ts` from it (light + dark).
2. Update `themeProvider` and `themeContext` (localStorage).
3. Restyle shared components to tokens; fix invalid props.
4. Add assets + manifest + metadata.
5. Remove Tailwind and the font mismatch.
6. `yarn verify`.

Rollback: revert the change; no data or API impact.

## Open Questions

- Final logo direction (wordmark vs. icon) — assume a simple plate/heart
  wordmark unless the user provides art.
