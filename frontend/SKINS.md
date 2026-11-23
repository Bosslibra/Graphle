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

## Game Tokens (minigames)

Games never hardcode colours: everything comes from the active variant, either as CSS variables or through `useCurrentSkinVariant().graph` (only `GraphBoard` reads the JS tokens, for the node/edge gradient).

| Token (`graph.*`) | CSS variable | Used for |
|---|---|---|
| `hues.start/end`, `node.*`, `edge.*` | (JS) | Node and edge colours on the board |
| `edge.labelStyle` | (JS) | Weight label shape: `"bead"` (the line flares into a circle) or `"pill"` (capsule rotated along the edge). Optional: defaults to `DEFAULT_EDGE_LABEL_STYLE` in `lib/themes/registry.ts` |
| `node.activeText` | `--graph-node-text` | Text on coloured nodes and palette swatches |
| `palette` (≥ 5 colours) | `--graph-palette-1…5` | Colouring game (colours must be clearly distinct; numbers are shown too) |
| `pathChip.*` | `--graph-path-chip-*` | Chips under the board and node badges |
| `result.win/loss` | `--graph-result-{win,loss}-*` | Result panel, correct/wrong edges, home tile status |
| `surfaces.graphBackground` | `--graphle-graph-bg` | Not used by the board (it has no background) |
| `surfaces.surfaceBackground` | `--graphle-surface-bg` | Game stat badge, home tiles |
| `surfaces.mutedBackground` | `--graphle-muted-bg` | Header, mode tabs |

Weight labels are placed by `layoutEdgeLabels` (`lib/graph/layout.ts`): each one slides along its own edge away from crossings, other labels and nodes, so labels of edges crossing at the same point never stack.

`result` (and `assets`) can be one value for both modes or `{ light, dark }`; give dark mode its own values whenever the foreground would be too dark on a dark background.

## Layout Contract

- The header (`components/layout/site-header.tsx`) is `--header-h` tall (3.5rem).
- A game page is exactly one screen tall (`100dvh - --header-h`, min 460px): title, mode tabs, status line, then `GameShell`, whose board (`GraphBoard`) takes the remaining space and stays square via container query units.
- New games should render inside `GameShell` and use `GraphBoard`; they then fit every screen and every skin with no extra work.

## Hydration

The chosen skin is stored in the `graphle-skin` cookie (`SITE_SKIN_COOKIE`). The root layout reads it, sets `data-skin` on `<html>` and renders the skin's CSS variables for both modes in a `<style id="skin-vars">` in `<head>` (`getSkinStylesheet`: `html:root{…light}` / `html:root.dark{…dark}`). next-themes puts `.dark` on `<html>` before paint, so the first paint already has the right skin and mode: no flash.

`SiteSkinProvider` receives the same id as `initialSkinId`, so server and client markup match. The colour mode is only known in the browser, so JS-read tokens (`useCurrentSkinVariant()`) are the light ones until hydration: anything that differs between modes must therefore be a CSS variable, not a JS value. A `?skin=` link and a skin saved in `localStorage` before the cookie existed are applied after hydration and written to the cookie.

## Tiers and entitlements

Every skin has a `tier`: `"free"` or `"premium"`. Access is decided in one place only, `lib/themes/entitlements.ts` (re-exported by `lib/skins`):

- `getEntitlements()` returns which premium skins the visitor may use. In the beta, `BETA_UNLOCK_ALL = true` unlocks all of them.
- `canUseSkin(skin)` and `resolveUsableSkinId(value)` (= `normalizeSiteSkinId` + the access check) are used by the root layout (cookie), `SiteSkinProvider` (`?skin=`, localStorage, `setSkin`, other tabs) and the skin switcher (locked entries are shown disabled).
- A locked skin always falls back to `DEFAULT_SITE_SKIN_ID`.

When payments arrive, only `getEntitlements` changes (e.g. a signed licence in a cookie, verified by the root layout). It must give the same answer on server and client, or the skin markup will not hydrate.

## Illustrated worlds

A skin with `world` (e.g. `realm`, "Regno") swaps the abstract board for per-game illustrations; skins without it are the abstract view.

- Art lives in `components/game/worlds/<world>/`, registered in `components/game/worlds/registry.ts`. Types: `components/game/worlds/types.ts` (`GameArt`).
- Per game, a world may provide `Node` (replaces circle + id), `roadBed` + `edgeStyle` (roads), `Weight` (replaces the bead/pill) and `Mover` (a piece standing on a node, e.g. the messenger).
- Games tell `GraphBoard` what they are drawing: `game`, `nodeRole(id)` (e.g. `"guarded"`, `"missed"`, `"start"`, `"goal"`) and `mover`. Game logic never depends on the skin.
- Art colours come only from CSS variables: `--art-ink`, `--art-paper`, `--art-shade`, `--art-gold`, `--art-road`, `--art-torch` (the variant's optional `art` tokens; abstract skins get fallbacks from their own colours), plus `--primary` and `--graph-palette-*`. Never read mode-dependent JS tokens in art (see Hydration).
- Short game texts may be overridden per world under `worlds.<world>.<game>.<key>` in `i18n/messages/*.json`; `useGameText(game)` falls back to `games.<game>.<key>`. Rules and theory are shared by every skin.
- Keep the node id readable (plaque), numbers always visible (weights, colouring badges) and art within ~1.35 × node radius.
