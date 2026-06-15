import { type SkinVariant } from "@/lib/themes/types";

export function getSkinCssVariables(variant: SkinVariant): Record<string, string> {
  const { colors, surfaces, layout, typography, graph, assets } = variant;

  return {
    "--background": colors.background,
    "--foreground": colors.foreground,
    "--card": colors.card,
    "--card-foreground": colors.cardForeground,
    "--popover": colors.popover,
    "--popover-foreground": colors.popoverForeground,
    "--primary": colors.primary,
    "--primary-foreground": colors.primaryForeground,
    "--secondary": colors.secondary,
    "--secondary-foreground": colors.secondaryForeground,
    "--muted": colors.muted,
    "--muted-foreground": colors.mutedForeground,
    "--accent": colors.accent,
    "--accent-foreground": colors.accentForeground,
    "--destructive": colors.destructive,
    "--border": colors.border,
    "--input": colors.input,
    "--ring": colors.ring,
    "--chart-1": colors.chart1,
    "--chart-2": colors.chart2,
    "--chart-3": colors.chart3,
    "--chart-4": colors.chart4,
    "--chart-5": colors.chart5,
    "--radius": colors.radius,
    "--sidebar": colors.sidebar,
    "--sidebar-foreground": colors.sidebarForeground,
    "--sidebar-primary": colors.sidebarPrimary,
    "--sidebar-primary-foreground": colors.sidebarPrimaryForeground,
    "--sidebar-accent": colors.sidebarAccent,
    "--sidebar-accent-foreground": colors.sidebarAccentForeground,
    "--sidebar-border": colors.sidebarBorder,
    "--sidebar-ring": colors.sidebarRing,
    "--font-sans": typography.fontSans,
    "--font-heading": typography.fontHeading,
    "--font-mono": typography.fontMono,
    "--skin-font-size-base": typography.baseFontSize,
    "--graphle-page-bg": surfaces.pageBackground,
    "--graphle-page-bg-image": surfaces.pageBackgroundImageUrl
      ? `url(\"${surfaces.pageBackgroundImageUrl}\")`
      : "none",
    "--graphle-page-bg-image-size": surfaces.pageBackgroundImageSize ?? "cover",
    "--graphle-page-bg-pattern": surfaces.pageBackgroundPatternSvg
      ? `url(\"${surfaces.pageBackgroundPatternSvg}\")`
      : "none",
    "--graphle-page-bg-pattern-size": surfaces.pageBackgroundPatternSize ?? "220px",
    "--graphle-surface-bg": surfaces.surfaceBackground,
    "--graphle-muted-bg": surfaces.mutedBackground,
    "--graphle-graph-bg": surfaces.graphBackground,
    "--skin-page-background": surfaces.pageBackground,
    "--skin-page-background-image": surfaces.pageBackgroundImageUrl
      ? `url(\"${surfaces.pageBackgroundImageUrl}\")`
      : "none",
    "--skin-page-background-image-size": surfaces.pageBackgroundImageSize ?? "cover",
    "--skin-page-background-pattern": surfaces.pageBackgroundPatternSvg
      ? `url(\"${surfaces.pageBackgroundPatternSvg}\")`
      : "none",
    "--skin-page-background-pattern-size": surfaces.pageBackgroundPatternSize ?? "220px",
    "--skin-main-surface": surfaces.surfaceBackground,
    "--skin-game-surface": layout.gameSurface,
    "--skin-controls-surface": surfaces.mutedBackground,
    "--graph-board-background": surfaces.graphBackground,
    "--graph-path-chip-bg": graph.pathChip.background,
    "--graph-path-chip-fg": graph.pathChip.foreground,
    "--graph-path-chip-border": graph.pathChip.border,
    "--graph-result-win-border": graph.result.win.border,
    "--graph-result-win-bg": graph.result.win.background,
    "--graph-result-win-fg": graph.result.win.foreground,
    "--graph-result-loss-border": graph.result.loss.border,
    "--graph-result-loss-bg": graph.result.loss.background,
    "--graph-result-loss-fg": graph.result.loss.foreground,
    "--graph-backdrop-color": graph.backdrop.tint,
    "--graph-backdrop-opacity": graph.backdrop.opacity,
    "--graph-backdrop-edge-width": graph.backdrop.edgeWidth,
    "--graph-backdrop-edge-opacity": graph.backdrop.edgeOpacity,
    "--graph-backdrop-node-opacity": graph.backdrop.nodeOpacity,
    "--graph-backdrop-hub-opacity": graph.backdrop.hubOpacity,
    "--graph-backdrop-image-opacity": graph.backdrop.imageOpacity,
    "--graph-backdrop-image-blend": graph.backdrop.imageBlendMode,
    "--skin-brand-icon": assets?.siteChromeIconSvg
      ? `url(\"${assets.siteChromeIconSvg}\")`
      : "none",
    "--skin-graph-overlay-svg": assets?.graphOverlaySvg
      ? `url(\"${assets.graphOverlaySvg}\")`
      : "none",
    "--skin-graph-backdrop-svg": assets?.graphBackdropSvg
      ? `url(\"${assets.graphBackdropSvg}\")`
      : "none",
  };
}
