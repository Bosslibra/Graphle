export type GraphBoardThemeTier = "free" | "premium";

export type GraphBoardThemeId = "aurora" | "sunset" | "forest" | "neon";

export interface GraphBoardTheme {
  id: GraphBoardThemeId;
  name: string;
  description: string;
  tier: GraphBoardThemeTier;
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
  };
}

export const DEFAULT_GRAPH_BOARD_THEME: GraphBoardThemeId = "aurora";

const graphBoardThemes: Record<GraphBoardThemeId, GraphBoardTheme> = {
  aurora: {
    id: "aurora",
    name: "Aurora Drift",
    description: "Clean cyan-to-magenta gradient used as the default board style.",
    tier: "free",
    hues: { start: 190, end: 330 },
    node: {
      lightness: 0.6,
      chroma: 0.18,
      activeText: "oklch(0.98 0 0)",
      inactiveFill: "var(--card)",
      inactiveStroke: "var(--border)",
      inactiveText: "var(--foreground)",
    },
    edge: {
      activeStrokeWidth: 4,
      inactiveStrokeWidth: 1.5,
      inactiveStroke: "var(--border)",
      inactiveOpacity: 0.4,
      drawDurationMs: 350,
      activeLabelText: "oklch(0.98 0 0)",
      inactiveLabelFill: "var(--card)",
      inactiveLabelStroke: "var(--border)",
      inactiveLabelText: "var(--muted-foreground)",
    },
  },
  sunset: {
    id: "sunset",
    name: "Sunset Pulse",
    description: "Warm orange-to-rose gradient with stronger saturation.",
    tier: "free",
    hues: { start: 35, end: 5 },
    node: {
      lightness: 0.64,
      chroma: 0.2,
      activeText: "oklch(0.98 0 0)",
      inactiveFill: "var(--card)",
      inactiveStroke: "var(--border)",
      inactiveText: "var(--foreground)",
    },
    edge: {
      activeStrokeWidth: 4,
      inactiveStrokeWidth: 1.5,
      inactiveStroke: "var(--border)",
      inactiveOpacity: 0.36,
      drawDurationMs: 320,
      activeLabelText: "oklch(0.98 0 0)",
      inactiveLabelFill: "var(--card)",
      inactiveLabelStroke: "var(--border)",
      inactiveLabelText: "var(--muted-foreground)",
    },
  },
  forest: {
    id: "forest",
    name: "Forest Arc",
    description: "Fresh emerald-to-lime range with calmer contrast.",
    tier: "free",
    hues: { start: 155, end: 110 },
    node: {
      lightness: 0.58,
      chroma: 0.16,
      activeText: "oklch(0.99 0 0)",
      inactiveFill: "var(--card)",
      inactiveStroke: "var(--border)",
      inactiveText: "var(--foreground)",
    },
    edge: {
      activeStrokeWidth: 4,
      inactiveStrokeWidth: 1.5,
      inactiveStroke: "var(--border)",
      inactiveOpacity: 0.35,
      drawDurationMs: 330,
      activeLabelText: "oklch(0.99 0 0)",
      inactiveLabelFill: "var(--card)",
      inactiveLabelStroke: "var(--border)",
      inactiveLabelText: "var(--muted-foreground)",
    },
  },
  neon: {
    id: "neon",
    name: "Neon Rival",
    description: "High-energy electric gradient intended as a premium skin.",
    tier: "premium",
    hues: { start: 250, end: 20 },
    node: {
      lightness: 0.67,
      chroma: 0.24,
      activeText: "oklch(0.08 0.01 260)",
      inactiveFill: "var(--card)",
      inactiveStroke: "var(--border)",
      inactiveText: "var(--foreground)",
    },
    edge: {
      activeStrokeWidth: 4.5,
      inactiveStrokeWidth: 1.5,
      inactiveStroke: "var(--border)",
      inactiveOpacity: 0.32,
      drawDurationMs: 260,
      activeLabelText: "oklch(0.08 0.01 260)",
      inactiveLabelFill: "var(--card)",
      inactiveLabelStroke: "var(--border)",
      inactiveLabelText: "var(--muted-foreground)",
    },
  },
};

export function getGraphBoardTheme(themeId?: GraphBoardThemeId): GraphBoardTheme {
  return graphBoardThemes[themeId ?? DEFAULT_GRAPH_BOARD_THEME] ?? graphBoardThemes[DEFAULT_GRAPH_BOARD_THEME];
}

export function getGraphBoardThemeOptions(includePremium = true): GraphBoardTheme[] {
  return Object.values(graphBoardThemes).filter(
    (theme) => includePremium || theme.tier !== "premium",
  );
}
