# Graphle Skins

Graphle theming is based on two independent dimensions:

- Skin: the visual family (default, paperwave, circuit).
- Color Mode: light or dark.

The runtime theme is their combination: Skin Variant = skin x mode.

## Core Terms

- Skin
  - A named style family.
  - Owns metadata and both of its mode variants.

- Color Mode
  - Controlled by next-themes (`light` or `dark`).
  - Remains compatible with shadcn/ui class-based dark mode behavior.

- Skin Variant
  - A concrete, mode-specific value set.
  - Example: `paperwave + dark`.
  - Holds all tokens applied to CSS variables.

## Source Files

- Public API:
  - `lib/skins/index.ts`
  - `lib/skins/types.ts`
  - `lib/skins/registry.ts`
  - `lib/skins/css-variables.ts`
  - `lib/skins/apply-skin-variant.ts`

- Underlying implementation:
  - `lib/themes/types.ts`
  - `lib/themes/registry.ts`
  - `lib/themes/css-variables.ts`
  - `lib/themes/apply-skin-variant.ts`

- Runtime provider/hooks:
  - `contexts/site-skin-context.tsx`

## Runtime Flow

1. `SiteSkinProvider` resolves the active skin id from `?skin=` or local storage (`graphle-site-skin`).
2. Color mode comes from next-themes (`resolvedTheme`).
3. Provider computes the active variant with `getSkinVariant(currentSkin, currentMode)`.
4. Provider applies CSS variables through `applySkinVariant(skinName, mode)`.
5. Components read:
   - CSS variables (shadcn tokens + custom vars), or
   - `useCurrentSkinVariant()` for direct graph/asset tokens.

## Behavior Guarantees

- User can toggle light/dark inside the currently selected skin.
- User can change skin without forcing mode change.
- When skin changes, current mode is preserved.
- Legacy links using `?skin=aurora` are normalized to `default`.

## Skin Schema

Each `SiteSkin` contains:

- `id`, `name`, `description`
- `variants.light` and `variants.dark`

Each `SkinVariant` contains:

- `colors`
  - Full shadcn token set (`background`, `foreground`, `primary`, `border`, `ring`, charts, sidebar tokens, etc.).
- `surfaces` (required)
  - `pageBackground` (required): full page background (color or gradient).
  - `surfaceBackground` (required): main surface background for central containers/cards.
  - `mutedBackground` (required): secondary surface background for drawers/panels.
  - `graphBackground` (required): graph area background.
  - `pageBackgroundImageUrl` (optional): texture/image layer for page background.
  - `pageBackgroundPatternSvg` (optional): svg pattern layer for page background.
- `layout`
  - Page and panel surface tokens.
  - Optional background image/pattern urls and sizing.
- `typography`
  - Font families and base size.
- `graph`
  - Graph board background.
  - Path chip/result colors.
  - Backdrop tint/opacity/line/node/image controls.
  - Node/edge rendering tokens.
- `assets` (optional)
  - `graphOverlaySvg`
  - `graphBackdropSvg`
  - `siteChromeIconSvg`

Background and surface vars applied from each variant:

- `--graphle-page-bg`
- `--graphle-surface-bg`
- `--graphle-muted-bg`
- `--graphle-graph-bg`

Conceptual example for a `green` skin:

- `green.light.surfaces.pageBackground` should be a light green-themed page background.
- `green.dark.surfaces.pageBackground` should be a dark green-themed page background.
- The same applies for `surfaceBackground`, `mutedBackground`, and `graphBackground` in both modes.

## API Quick Reference

- `useSiteSkin()` returns:
  - `currentSkinId`
  - `currentSkin`
  - `currentMode`
  - `currentVariant`
  - `skins`
  - `setSkin(skinId)`
  - `setMode(mode)`

- `useCurrentSkinVariant()` returns only the active variant.

- `applySkinVariant(skinName, mode, target?)`
  - Resolves the correct variant.
  - Applies all CSS variables.
  - Writes `data-skin` and `data-skin-mode` attributes.

## Add A New Skin

1. Add the id to `SiteSkinId` in `lib/themes/types.ts`.
2. Add the skin entry in `lib/themes/registry.ts`.
3. Define both variants:
   - `variants.light`
   - `variants.dark`
4. Fill required token groups (`colors`, `surfaces`, `layout`, `typography`, `graph`; optional `assets`).
5. Choose and fill appropriate `pageBackground`, `surfaceBackground`, `mutedBackground`, and optionally layered page background media (`pageBackgroundImageUrl`, `pageBackgroundPatternSvg`) for both light and dark variants so page background and main surfaces are visibly themed.
6. Ensure `graphBackground` is also set for both variants so the graph panel changes with skin and mode.
7. Verify in app:
   - change skin while staying in light mode,
   - toggle to dark mode,
   - switch back to another skin and confirm mode is preserved.

No component rewiring should be needed if fields are complete.
