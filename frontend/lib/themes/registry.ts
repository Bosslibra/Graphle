import {
  type ColorMode,
  type ShadcnColorTokens,
  type SiteSkin,
  type SiteSkinId,
  type SkinAssets,
  type SkinGraphTokens,
  type SkinLayoutTokens,
  type SkinTypographyTokens,
  type SkinVariant,
} from "@/lib/themes/types";

interface LegacyGraphTokens {
  hues: SkinGraphTokens["hues"];
  node: SkinGraphTokens["node"];
  edge: SkinGraphTokens["edge"];
  boardBackground: Record<ColorMode, string>;
  pathChip: SkinGraphTokens["pathChip"];
  result: SkinGraphTokens["result"];
}

interface LegacySkin {
  id: SiteSkinId;
  name: string;
  description: string;
  typography: SkinTypographyTokens;
  modes: Record<ColorMode, { colors: ShadcnColorTokens; layout: SkinLayoutTokens }>;
  graph: LegacyGraphTokens;
  assets?: SkinAssets | Record<ColorMode, SkinAssets>;
}

function resolveLegacyAssets(
  assets: LegacySkin["assets"],
  mode: ColorMode,
): SkinAssets | undefined {
  if (!assets) {
    return undefined;
  }

  const modeAssets = assets as Partial<Record<ColorMode, SkinAssets>>;
  if (modeAssets.light || modeAssets.dark) {
    return modeAssets[mode] ?? modeAssets.light ?? modeAssets.dark;
  }

  return assets as SkinAssets;
}

function toSkinVariant(legacy: LegacySkin, mode: ColorMode): SkinVariant {
  const modeTokens = legacy.modes[mode];
  const graphBackground = legacy.graph.boardBackground[mode];

  return {
    typography: legacy.typography,
    colors: modeTokens.colors,
    surfaces: {
      pageBackground: modeTokens.layout.pageBackground,
      surfaceBackground: modeTokens.layout.mainSurface,
      mutedBackground: modeTokens.layout.controlsSurface,
      graphBackground,
      pageBackgroundImageUrl: modeTokens.layout.pageBackgroundImageUrl,
      pageBackgroundImageSize: modeTokens.layout.pageBackgroundImageSize,
      pageBackgroundPatternSvg: modeTokens.layout.pageBackgroundPatternSvg,
      pageBackgroundPatternSize: modeTokens.layout.pageBackgroundPatternSize,
    },
    layout: modeTokens.layout,
    graph: {
      hues: legacy.graph.hues,
      node: legacy.graph.node,
      edge: legacy.graph.edge,
      boardBackground: graphBackground,
      pathChip: legacy.graph.pathChip,
      backdrop: {
        tint: modeTokens.layout.graphBackdropTint,
        opacity: modeTokens.layout.graphBackdropOpacity,
        edgeWidth: "0.75",
        edgeOpacity: "1",
        nodeOpacity: "0.28",
        hubOpacity: "0.5",
        imageOpacity: "0.14",
        imageBlendMode: "screen",
      },
      result: legacy.graph.result,
    },
    assets: resolveLegacyAssets(legacy.assets, mode),
  };
}

function toSiteSkin(legacy: LegacySkin): SiteSkin {
  return {
    id: legacy.id,
    name: legacy.name,
    description: legacy.description,
    variants: {
      light: toSkinVariant(legacy, "light"),
      dark: toSkinVariant(legacy, "dark"),
    },
  };
}

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const NOISE_BITMAP_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAADUlEQVR42mP8z/CfAQAFgwJ/l0J7WQAAAABJRU5ErkJggg==";

const auroraPattern = svgToDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'>
  <defs>
    <linearGradient id='a' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='rgba(80, 180, 255, 0.18)' />
      <stop offset='100%' stop-color='rgba(255, 90, 180, 0.14)' />
    </linearGradient>
  </defs>
  <path d='M0 38 C 30 8, 70 8, 100 38 S 170 68, 200 38' stroke='url(#a)' stroke-width='2' fill='none' />
  <path d='M-30 94 C 0 64, 50 64, 80 94 S 150 124, 180 94' stroke='url(#a)' stroke-width='2' fill='none' />
</svg>
`);

const paperPattern = svgToDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 220'>
  <filter id='n'>
    <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#n)' opacity='0.12'/>
</svg>
`);

const circuitPattern = svgToDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 220'>
  <g fill='none' stroke='rgba(124,255,214,0.28)' stroke-width='1'>
    <path d='M20 20 H100 V80 H180' />
    <path d='M20 140 H80 V180 H200' />
    <path d='M40 40 V120 H140 V200' />
    <circle cx='100' cy='80' r='4' fill='rgba(124,255,214,0.35)' />
    <circle cx='80' cy='180' r='4' fill='rgba(124,255,214,0.35)' />
  </g>
</svg>
`);

const siteChromeMark = svgToDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#5ce1e6'/>
      <stop offset='100%' stop-color='#ff7eb8'/>
    </linearGradient>
  </defs>
  <path d='M10 20 L32 8 L54 20 V44 L32 56 L10 44 Z' fill='url(#g)'/>
  <circle cx='32' cy='32' r='8' fill='rgba(8,16,32,0.55)' />
</svg>
`);

const graphOverlayAurora = svgToDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 380 380'>
  <defs>
    <radialGradient id='halo' cx='50%' cy='50%' r='65%'>
      <stop offset='0%' stop-color='rgba(255,255,255,0.18)' />
      <stop offset='100%' stop-color='rgba(255,255,255,0)' />
    </radialGradient>
  </defs>
  <circle cx='190' cy='190' r='190' fill='url(#halo)'/>
</svg>
`);

const graphOverlayPaper = svgToDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 380 380'>
  <g stroke='rgba(119,89,45,0.15)' stroke-width='1' fill='none'>
    <path d='M0 75 C110 45, 270 45, 380 75'/>
    <path d='M0 190 C110 160, 270 160, 380 190'/>
    <path d='M0 305 C110 275, 270 275, 380 305'/>
  </g>
</svg>
`);

const graphOverlayCircuit = svgToDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 380 380'>
  <g fill='none' stroke='rgba(120,255,220,0.25)' stroke-width='1.2'>
    <path d='M30 40 H160 V120 H350' />
    <path d='M30 190 H130 V300 H350' />
    <path d='M190 40 V190 H300 V340' />
  </g>
</svg>
`);

export const DEFAULT_SITE_SKIN_ID: SiteSkinId = "default";
export const SITE_SKIN_STORAGE_KEY = "graphle-site-skin";

const legacySiteSkins: Record<SiteSkinId, LegacySkin> = {
  default: {
    id: "default",
    name: "Default",
    description: "Baseline Graphle look with balanced contrast in both light and dark modes.",
    typography: {
      fontSans: "var(--font-inter)",
      fontHeading: "var(--font-space-grotesk)",
      fontMono: "var(--font-jetbrains-mono)",
      baseFontSize: "18px",
    },
    modes: {
      light: {
        colors: {
          background: "oklch(0.985 0.008 222)",
          foreground: "oklch(0.235 0.03 251)",
          card: "oklch(0.99 0.01 244 / 92%)",
          cardForeground: "oklch(0.235 0.03 251)",
          popover: "oklch(0.99 0.01 244)",
          popoverForeground: "oklch(0.235 0.03 251)",
          primary: "oklch(0.59 0.17 251)",
          primaryForeground: "oklch(0.99 0.01 244)",
          secondary: "oklch(0.93 0.03 236)",
          secondaryForeground: "oklch(0.29 0.04 251)",
          muted: "oklch(0.95 0.02 236)",
          mutedForeground: "oklch(0.5 0.04 244)",
          accent: "oklch(0.9 0.04 300)",
          accentForeground: "oklch(0.3 0.06 279)",
          destructive: "oklch(0.61 0.22 27)",
          border: "oklch(0.87 0.03 239)",
          input: "oklch(0.87 0.03 239)",
          ring: "oklch(0.65 0.16 251)",
          chart1: "oklch(0.72 0.16 238)",
          chart2: "oklch(0.68 0.18 301)",
          chart3: "oklch(0.74 0.14 175)",
          chart4: "oklch(0.67 0.17 36)",
          chart5: "oklch(0.63 0.2 330)",
          sidebar: "oklch(0.98 0.01 236)",
          sidebarForeground: "oklch(0.235 0.03 251)",
          sidebarPrimary: "oklch(0.59 0.17 251)",
          sidebarPrimaryForeground: "oklch(0.99 0.01 244)",
          sidebarAccent: "oklch(0.93 0.03 236)",
          sidebarAccentForeground: "oklch(0.29 0.04 251)",
          sidebarBorder: "oklch(0.87 0.03 239)",
          sidebarRing: "oklch(0.65 0.16 251)",
          radius: "0.8rem",
        },
        layout: {
          pageBackground:
            "linear-gradient(145deg, oklch(0.98 0.015 232), oklch(0.94 0.03 288) 55%, oklch(0.95 0.02 188))",
          pageBackgroundPatternSvg: auroraPattern,
          pageBackgroundPatternSize: "220px",
          mainSurface: "linear-gradient(155deg, oklch(1 0 0 / 0.72), oklch(0.97 0.015 230 / 0.74))",
          gameSurface: "linear-gradient(140deg, oklch(1 0 0 / 0.74), oklch(0.96 0.02 275 / 0.65))",
          controlsSurface: "oklch(1 0 0 / 0.82)",
          graphBackdropTint: "oklch(0.39 0.08 246)",
          graphBackdropOpacity: "0.5",
        },
      },
      dark: {
        colors: {
          background: "oklch(0.14 0.03 252)",
          foreground: "oklch(0.95 0.02 240)",
          card: "oklch(0.18 0.03 252 / 90%)",
          cardForeground: "oklch(0.95 0.02 240)",
          popover: "oklch(0.18 0.03 252)",
          popoverForeground: "oklch(0.95 0.02 240)",
          primary: "oklch(0.78 0.13 253)",
          primaryForeground: "oklch(0.17 0.03 252)",
          secondary: "oklch(0.26 0.03 252)",
          secondaryForeground: "oklch(0.95 0.02 240)",
          muted: "oklch(0.24 0.03 252)",
          mutedForeground: "oklch(0.74 0.04 246)",
          accent: "oklch(0.3 0.05 300)",
          accentForeground: "oklch(0.96 0.02 240)",
          destructive: "oklch(0.68 0.2 28)",
          border: "oklch(0.3 0.03 252)",
          input: "oklch(0.31 0.03 252)",
          ring: "oklch(0.72 0.14 253)",
          chart1: "oklch(0.76 0.13 253)",
          chart2: "oklch(0.72 0.14 307)",
          chart3: "oklch(0.78 0.12 186)",
          chart4: "oklch(0.77 0.14 44)",
          chart5: "oklch(0.75 0.15 332)",
          sidebar: "oklch(0.19 0.03 252)",
          sidebarForeground: "oklch(0.95 0.02 240)",
          sidebarPrimary: "oklch(0.78 0.13 253)",
          sidebarPrimaryForeground: "oklch(0.17 0.03 252)",
          sidebarAccent: "oklch(0.25 0.03 252)",
          sidebarAccentForeground: "oklch(0.95 0.02 240)",
          sidebarBorder: "oklch(0.3 0.03 252)",
          sidebarRing: "oklch(0.72 0.14 253)",
          radius: "0.8rem",
        },
        layout: {
          pageBackground:
            "radial-gradient(circle at 20% 20%, oklch(0.3 0.08 252 / 0.45), transparent 45%), radial-gradient(circle at 80% 0%, oklch(0.37 0.1 320 / 0.38), transparent 50%), oklch(0.12 0.03 252)",
          pageBackgroundPatternSvg: auroraPattern,
          pageBackgroundPatternSize: "220px",
          mainSurface: "linear-gradient(160deg, oklch(0.19 0.03 252 / 0.74), oklch(0.16 0.03 252 / 0.88))",
          gameSurface: "linear-gradient(140deg, oklch(0.2 0.03 252 / 0.78), oklch(0.14 0.04 300 / 0.76))",
          controlsSurface: "oklch(0.2 0.03 252 / 0.86)",
          graphBackdropTint: "oklch(0.82 0.12 251)",
          graphBackdropOpacity: "0.34",
        },
      },
    },
    graph: {
      hues: { start: 195, end: 330 },
      node: {
        lightness: 0.62,
        chroma: 0.2,
        activeText: "oklch(0.99 0.01 250)",
        inactiveFill: "var(--card)",
        inactiveStroke: "var(--border)",
        inactiveText: "var(--foreground)",
        labelFontSize: 13,
      },
      edge: {
        activeStrokeWidth: 4.2,
        inactiveStrokeWidth: 1.6,
        inactiveStroke: "var(--border)",
        inactiveOpacity: 0.38,
        drawDurationMs: 340,
        activeLabelText: "oklch(0.99 0.01 250)",
        inactiveLabelFill: "var(--card)",
        inactiveLabelStroke: "var(--border)",
        inactiveLabelText: "var(--muted-foreground)",
        labelFontSize: 10,
      },
      boardBackground: {
        light: "linear-gradient(135deg, oklch(0.98 0.03 215), oklch(0.95 0.04 305))",
        dark: "linear-gradient(135deg, oklch(0.18 0.05 230), oklch(0.13 0.05 305))",
      },
      pathChip: {
        background: "oklch(0.56 0.13 250 / 0.78)",
        foreground: "oklch(0.98 0.01 250)",
        border: "oklch(0.64 0.14 250 / 0.6)",
      },
      result: {
        win: {
          border: "oklch(0.62 0.17 164 / 0.45)",
          background: "oklch(0.94 0.05 164 / 0.34)",
          foreground: "oklch(0.45 0.11 164)",
        },
        loss: {
          border: "oklch(0.62 0.19 30 / 0.45)",
          background: "oklch(0.95 0.05 30 / 0.34)",
          foreground: "oklch(0.53 0.15 30)",
        },
      },
    },
    assets: {
      siteChromeIconSvg: siteChromeMark,
      graphOverlaySvg: graphOverlayAurora,
      graphBackdropSvg: auroraPattern,
    },
  },
  paperwave: {
    id: "paperwave",
    name: "Paperwave",
    description: "Editorial warm paper mood with serif-heavy typography.",
    typography: {
      fontSans: "var(--font-fraunces)",
      fontHeading: "var(--font-fraunces)",
      fontMono: "var(--font-jetbrains-mono)",
      baseFontSize: "19px",
    },
    modes: {
      light: {
        colors: {
          background: "oklch(0.98 0.02 88)",
          foreground: "oklch(0.28 0.04 65)",
          card: "oklch(0.99 0.01 90 / 92%)",
          cardForeground: "oklch(0.28 0.04 65)",
          popover: "oklch(0.99 0.01 90)",
          popoverForeground: "oklch(0.28 0.04 65)",
          primary: "oklch(0.52 0.1 52)",
          primaryForeground: "oklch(0.99 0.01 90)",
          secondary: "oklch(0.93 0.03 86)",
          secondaryForeground: "oklch(0.33 0.05 58)",
          muted: "oklch(0.95 0.02 85)",
          mutedForeground: "oklch(0.53 0.05 62)",
          accent: "oklch(0.9 0.06 110)",
          accentForeground: "oklch(0.31 0.06 75)",
          destructive: "oklch(0.6 0.2 32)",
          border: "oklch(0.84 0.04 80)",
          input: "oklch(0.84 0.04 80)",
          ring: "oklch(0.57 0.12 58)",
          chart1: "oklch(0.63 0.12 56)",
          chart2: "oklch(0.62 0.09 100)",
          chart3: "oklch(0.59 0.09 155)",
          chart4: "oklch(0.57 0.12 27)",
          chart5: "oklch(0.52 0.08 78)",
          sidebar: "oklch(0.98 0.02 88)",
          sidebarForeground: "oklch(0.28 0.04 65)",
          sidebarPrimary: "oklch(0.52 0.1 52)",
          sidebarPrimaryForeground: "oklch(0.99 0.01 90)",
          sidebarAccent: "oklch(0.93 0.03 86)",
          sidebarAccentForeground: "oklch(0.33 0.05 58)",
          sidebarBorder: "oklch(0.84 0.04 80)",
          sidebarRing: "oklch(0.57 0.12 58)",
          radius: "0.45rem",
        },
        layout: {
          pageBackground:
            "linear-gradient(145deg, oklch(0.98 0.02 88), oklch(0.95 0.03 82) 58%, oklch(0.94 0.03 104))",
          pageBackgroundImageUrl: NOISE_BITMAP_DATA_URI,
          pageBackgroundImageSize: "180px",
          pageBackgroundPatternSvg: paperPattern,
          pageBackgroundPatternSize: "240px",
          mainSurface: "linear-gradient(180deg, oklch(0.99 0.015 88 / 0.92), oklch(0.97 0.02 82 / 0.86))",
          gameSurface: "linear-gradient(140deg, oklch(0.99 0.01 88 / 0.9), oklch(0.95 0.03 92 / 0.82))",
          controlsSurface: "oklch(0.99 0.01 88 / 0.92)",
          graphBackdropTint: "oklch(0.45 0.07 78)",
          graphBackdropOpacity: "0.35",
        },
      },
      dark: {
        colors: {
          background: "oklch(0.19 0.03 72)",
          foreground: "oklch(0.93 0.02 90)",
          card: "oklch(0.24 0.03 72 / 90%)",
          cardForeground: "oklch(0.93 0.02 90)",
          popover: "oklch(0.24 0.03 72)",
          popoverForeground: "oklch(0.93 0.02 90)",
          primary: "oklch(0.76 0.09 73)",
          primaryForeground: "oklch(0.2 0.03 72)",
          secondary: "oklch(0.31 0.03 72)",
          secondaryForeground: "oklch(0.93 0.02 90)",
          muted: "oklch(0.29 0.03 72)",
          mutedForeground: "oklch(0.77 0.03 88)",
          accent: "oklch(0.34 0.06 108)",
          accentForeground: "oklch(0.96 0.01 90)",
          destructive: "oklch(0.69 0.18 34)",
          border: "oklch(0.36 0.03 72)",
          input: "oklch(0.36 0.03 72)",
          ring: "oklch(0.74 0.1 73)",
          chart1: "oklch(0.74 0.1 73)",
          chart2: "oklch(0.71 0.08 108)",
          chart3: "oklch(0.7 0.08 152)",
          chart4: "oklch(0.7 0.11 31)",
          chart5: "oklch(0.66 0.07 84)",
          sidebar: "oklch(0.23 0.03 72)",
          sidebarForeground: "oklch(0.93 0.02 90)",
          sidebarPrimary: "oklch(0.76 0.09 73)",
          sidebarPrimaryForeground: "oklch(0.2 0.03 72)",
          sidebarAccent: "oklch(0.31 0.03 72)",
          sidebarAccentForeground: "oklch(0.93 0.02 90)",
          sidebarBorder: "oklch(0.36 0.03 72)",
          sidebarRing: "oklch(0.74 0.1 73)",
          radius: "0.45rem",
        },
        layout: {
          pageBackground:
            "radial-gradient(circle at 15% 20%, oklch(0.35 0.05 72 / 0.35), transparent 52%), oklch(0.17 0.03 72)",
          pageBackgroundImageUrl: NOISE_BITMAP_DATA_URI,
          pageBackgroundImageSize: "200px",
          pageBackgroundPatternSvg: paperPattern,
          pageBackgroundPatternSize: "260px",
          mainSurface: "linear-gradient(170deg, oklch(0.25 0.03 72 / 0.76), oklch(0.21 0.03 72 / 0.92))",
          gameSurface: "linear-gradient(140deg, oklch(0.24 0.03 72 / 0.82), oklch(0.2 0.03 78 / 0.78))",
          controlsSurface: "oklch(0.24 0.03 72 / 0.84)",
          graphBackdropTint: "oklch(0.78 0.08 78)",
          graphBackdropOpacity: "0.25",
        },
      },
    },
    graph: {
      hues: { start: 54, end: 145 },
      node: {
        lightness: 0.66,
        chroma: 0.14,
        activeText: "oklch(0.19 0.03 72)",
        inactiveFill: "var(--card)",
        inactiveStroke: "var(--border)",
        inactiveText: "var(--foreground)",
        labelFontSize: 13,
      },
      edge: {
        activeStrokeWidth: 4,
        inactiveStrokeWidth: 1.6,
        inactiveStroke: "var(--border)",
        inactiveOpacity: 0.34,
        drawDurationMs: 360,
        activeLabelText: "oklch(0.19 0.03 72)",
        inactiveLabelFill: "var(--card)",
        inactiveLabelStroke: "var(--border)",
        inactiveLabelText: "var(--muted-foreground)",
        labelFontSize: 10,
      },
      boardBackground: {
        light: "linear-gradient(135deg, oklch(0.99 0.02 86), oklch(0.95 0.03 105))",
        dark: "linear-gradient(135deg, oklch(0.3 0.03 72), oklch(0.23 0.03 100))",
      },
      pathChip: {
        background: "oklch(0.58 0.1 58 / 0.7)",
        foreground: "oklch(0.98 0.01 90)",
        border: "oklch(0.62 0.11 58 / 0.55)",
      },
      result: {
        win: {
          border: "oklch(0.62 0.13 145 / 0.45)",
          background: "oklch(0.92 0.06 145 / 0.35)",
          foreground: "oklch(0.46 0.1 145)",
        },
        loss: {
          border: "oklch(0.62 0.16 33 / 0.45)",
          background: "oklch(0.93 0.05 33 / 0.35)",
          foreground: "oklch(0.5 0.13 33)",
        },
      },
    },
    assets: {
      siteChromeIconSvg: siteChromeMark,
      graphOverlaySvg: graphOverlayPaper,
      graphBackdropSvg: paperPattern,
    },
  },
  circuit: {
    id: "circuit",
    name: "Circuit Pulse",
    description: "High-contrast control-room style with luminous cyan traces.",
    typography: {
      fontSans: "var(--font-space-grotesk)",
      fontHeading: "var(--font-space-grotesk)",
      fontMono: "var(--font-jetbrains-mono)",
      baseFontSize: "17px",
    },
    modes: {
      light: {
        colors: {
          background: "oklch(0.97 0.01 210)",
          foreground: "oklch(0.22 0.03 225)",
          card: "oklch(0.99 0.01 210 / 92%)",
          cardForeground: "oklch(0.22 0.03 225)",
          popover: "oklch(0.99 0.01 210)",
          popoverForeground: "oklch(0.22 0.03 225)",
          primary: "oklch(0.55 0.14 196)",
          primaryForeground: "oklch(0.98 0.01 210)",
          secondary: "oklch(0.92 0.02 210)",
          secondaryForeground: "oklch(0.24 0.03 225)",
          muted: "oklch(0.94 0.02 210)",
          mutedForeground: "oklch(0.5 0.03 220)",
          accent: "oklch(0.9 0.05 176)",
          accentForeground: "oklch(0.24 0.03 225)",
          destructive: "oklch(0.6 0.21 28)",
          border: "oklch(0.84 0.03 210)",
          input: "oklch(0.84 0.03 210)",
          ring: "oklch(0.6 0.14 196)",
          chart1: "oklch(0.66 0.14 196)",
          chart2: "oklch(0.64 0.13 167)",
          chart3: "oklch(0.63 0.14 238)",
          chart4: "oklch(0.61 0.15 34)",
          chart5: "oklch(0.58 0.12 208)",
          sidebar: "oklch(0.98 0.01 210)",
          sidebarForeground: "oklch(0.22 0.03 225)",
          sidebarPrimary: "oklch(0.55 0.14 196)",
          sidebarPrimaryForeground: "oklch(0.98 0.01 210)",
          sidebarAccent: "oklch(0.92 0.02 210)",
          sidebarAccentForeground: "oklch(0.24 0.03 225)",
          sidebarBorder: "oklch(0.84 0.03 210)",
          sidebarRing: "oklch(0.6 0.14 196)",
          radius: "0.7rem",
        },
        layout: {
          pageBackground:
            "radial-gradient(circle at 100% 0%, oklch(0.85 0.05 196 / 0.35), transparent 50%), linear-gradient(145deg, oklch(0.97 0.01 210), oklch(0.94 0.02 220))",
          pageBackgroundPatternSvg: circuitPattern,
          pageBackgroundPatternSize: "230px",
          mainSurface: "linear-gradient(170deg, oklch(1 0 0 / 0.8), oklch(0.95 0.02 210 / 0.78))",
          gameSurface: "linear-gradient(145deg, oklch(1 0 0 / 0.82), oklch(0.94 0.02 194 / 0.74))",
          controlsSurface: "oklch(1 0 0 / 0.86)",
          graphBackdropTint: "oklch(0.37 0.11 200)",
          graphBackdropOpacity: "0.46",
        },
      },
      dark: {
        colors: {
          background: "oklch(0.12 0.02 230)",
          foreground: "oklch(0.94 0.02 210)",
          card: "oklch(0.16 0.02 230 / 92%)",
          cardForeground: "oklch(0.94 0.02 210)",
          popover: "oklch(0.16 0.02 230)",
          popoverForeground: "oklch(0.94 0.02 210)",
          primary: "oklch(0.77 0.16 193)",
          primaryForeground: "oklch(0.14 0.02 230)",
          secondary: "oklch(0.23 0.03 230)",
          secondaryForeground: "oklch(0.94 0.02 210)",
          muted: "oklch(0.21 0.03 230)",
          mutedForeground: "oklch(0.73 0.04 210)",
          accent: "oklch(0.28 0.06 176)",
          accentForeground: "oklch(0.96 0.02 210)",
          destructive: "oklch(0.68 0.2 29)",
          border: "oklch(0.28 0.03 230)",
          input: "oklch(0.3 0.03 230)",
          ring: "oklch(0.74 0.16 193)",
          chart1: "oklch(0.76 0.16 193)",
          chart2: "oklch(0.74 0.14 169)",
          chart3: "oklch(0.73 0.13 240)",
          chart4: "oklch(0.72 0.14 36)",
          chart5: "oklch(0.69 0.12 210)",
          sidebar: "oklch(0.17 0.02 230)",
          sidebarForeground: "oklch(0.94 0.02 210)",
          sidebarPrimary: "oklch(0.77 0.16 193)",
          sidebarPrimaryForeground: "oklch(0.14 0.02 230)",
          sidebarAccent: "oklch(0.23 0.03 230)",
          sidebarAccentForeground: "oklch(0.94 0.02 210)",
          sidebarBorder: "oklch(0.28 0.03 230)",
          sidebarRing: "oklch(0.74 0.16 193)",
          radius: "0.7rem",
        },
        layout: {
          pageBackground:
            "radial-gradient(circle at 80% 0%, oklch(0.35 0.12 190 / 0.35), transparent 45%), radial-gradient(circle at 20% 100%, oklch(0.3 0.1 240 / 0.35), transparent 50%), oklch(0.11 0.02 230)",
          pageBackgroundPatternSvg: circuitPattern,
          pageBackgroundPatternSize: "230px",
          mainSurface: "linear-gradient(165deg, oklch(0.17 0.02 230 / 0.78), oklch(0.14 0.03 230 / 0.9))",
          gameSurface: "linear-gradient(145deg, oklch(0.18 0.03 230 / 0.8), oklch(0.12 0.03 194 / 0.82))",
          controlsSurface: "oklch(0.17 0.03 230 / 0.84)",
          graphBackdropTint: "oklch(0.82 0.14 191)",
          graphBackdropOpacity: "0.31",
        },
      },
    },
    graph: {
      hues: { start: 192, end: 142 },
      node: {
        lightness: 0.64,
        chroma: 0.22,
        activeText: "oklch(0.12 0.02 230)",
        inactiveFill: "var(--card)",
        inactiveStroke: "var(--border)",
        inactiveText: "var(--foreground)",
        labelFontSize: 13,
      },
      edge: {
        activeStrokeWidth: 4.6,
        inactiveStrokeWidth: 1.6,
        inactiveStroke: "var(--border)",
        inactiveOpacity: 0.35,
        drawDurationMs: 290,
        activeLabelText: "oklch(0.12 0.02 230)",
        inactiveLabelFill: "var(--card)",
        inactiveLabelStroke: "var(--border)",
        inactiveLabelText: "var(--muted-foreground)",
        labelFontSize: 10,
      },
      boardBackground: {
        light: "linear-gradient(135deg, oklch(0.97 0.03 196), oklch(0.94 0.03 230))",
        dark: "linear-gradient(135deg, oklch(0.14 0.03 193), oklch(0.1 0.03 232))",
      },
      pathChip: {
        background: "oklch(0.53 0.15 196 / 0.76)",
        foreground: "oklch(0.97 0.01 210)",
        border: "oklch(0.63 0.16 196 / 0.55)",
      },
      result: {
        win: {
          border: "oklch(0.63 0.15 164 / 0.45)",
          background: "oklch(0.92 0.06 164 / 0.35)",
          foreground: "oklch(0.43 0.11 164)",
        },
        loss: {
          border: "oklch(0.64 0.19 30 / 0.45)",
          background: "oklch(0.93 0.06 30 / 0.35)",
          foreground: "oklch(0.51 0.14 30)",
        },
      },
    },
    assets: {
      siteChromeIconSvg: siteChromeMark,
      graphOverlaySvg: graphOverlayCircuit,
      graphBackdropSvg: circuitPattern,
    },
  },
};

export const siteSkinRegistry: Record<SiteSkinId, SiteSkin> = {
  default: toSiteSkin(legacySiteSkins.default),
  paperwave: toSiteSkin(legacySiteSkins.paperwave),
  circuit: toSiteSkin(legacySiteSkins.circuit),
};

const SKIN_ALIASES: Record<string, SiteSkinId> = {
  aurora: "default",
};

export const siteSkinOptions = Object.values(siteSkinRegistry);

export function normalizeSiteSkinId(value: string | null | undefined): SiteSkinId | undefined {
  if (!value) {
    return undefined;
  }

  if (value in siteSkinRegistry) {
    return value as SiteSkinId;
  }

  return SKIN_ALIASES[value];
}

export function isSiteSkinId(value: string): value is SiteSkinId {
  return normalizeSiteSkinId(value) !== undefined;
}

export function getSiteSkin(id: SiteSkinId | undefined): SiteSkin {
  return siteSkinRegistry[id ?? DEFAULT_SITE_SKIN_ID] ?? siteSkinRegistry[DEFAULT_SITE_SKIN_ID];
}

export function getSkinVariant(skin: SiteSkin | SiteSkinId, mode: ColorMode): SkinVariant {
  const selectedSkin = typeof skin === "string" ? getSiteSkin(skin) : skin;
  return selectedSkin.variants[mode];
}
