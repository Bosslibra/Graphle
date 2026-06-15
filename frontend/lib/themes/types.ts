export type ColorMode = "light" | "dark";

export type SiteSkinId = "default" | "paperwave" | "circuit";

export interface ShadcnColorTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  radius: string;
}

export interface SkinLayoutTokens {
  pageBackground: string;
  pageBackgroundImageUrl?: string;
  pageBackgroundImageSize?: string;
  pageBackgroundPatternSvg?: string;
  pageBackgroundPatternSize?: string;
  mainSurface: string;
  gameSurface: string;
  controlsSurface: string;
  graphBackdropTint: string;
  graphBackdropOpacity: string;
}

export interface SkinSurfaceTokens {
  pageBackground: string;
  surfaceBackground: string;
  mutedBackground: string;
  graphBackground: string;
  pageBackgroundImageUrl?: string;
  pageBackgroundImageSize?: string;
  pageBackgroundPatternSvg?: string;
  pageBackgroundPatternSize?: string;
}

export interface SkinTypographyTokens {
  fontSans: string;
  fontHeading: string;
  fontMono: string;
  baseFontSize: string;
}

export interface SkinGraphTokens {
  hues: {
    start: number;
    end: number;
  };
  node: {
    lightness: number;
    chroma: number;
    activeText: string;
    inactiveFill: string;
    inactiveStroke: string;
    inactiveText: string;
    labelFontSize: number;
  };
  edge: {
    activeStrokeWidth: number;
    inactiveStrokeWidth: number;
    inactiveStroke: string;
    inactiveOpacity: number;
    drawDurationMs: number;
    activeLabelText: string;
    inactiveLabelFill: string;
    inactiveLabelStroke: string;
    inactiveLabelText: string;
    labelFontSize: number;
  };
  boardBackground: string;
  pathChip: {
    background: string;
    foreground: string;
    border: string;
  };
  backdrop: {
    tint: string;
    opacity: string;
    edgeWidth: string;
    edgeOpacity: string;
    nodeOpacity: string;
    hubOpacity: string;
    imageOpacity: string;
    imageBlendMode: string;
  };
  result: {
    win: {
      border: string;
      background: string;
      foreground: string;
    };
    loss: {
      border: string;
      background: string;
      foreground: string;
    };
  };
}

export interface SkinAssets {
  siteChromeIconSvg?: string;
  graphOverlaySvg?: string;
  graphBackdropSvg?: string;
}

export interface SkinVariant {
  typography: SkinTypographyTokens;
  colors: ShadcnColorTokens;
  surfaces: SkinSurfaceTokens;
  layout: SkinLayoutTokens;
  graph: SkinGraphTokens;
  assets?: SkinAssets;
}

export interface SiteSkin {
  id: SiteSkinId;
  name: string;
  description: string;
  variants: Record<ColorMode, SkinVariant>;
}

export type ThemeMode = ColorMode;
