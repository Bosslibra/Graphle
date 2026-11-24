/**
 * SVG pieces shared by every illustrated world. Drawn around (0, 0) and coloured only with CSS
 * variables (`--art-*`, theme tokens), so each world's skin restyles them in light and dark mode.
 */
import type { EdgeArtStyle, EdgeArtVisual } from "@/components/game/worlds/types";

export const ART = {
  INK: "var(--art-ink)",
  PAPER: "var(--art-paper)",
  SHADE: "var(--art-shade)",
  GOLD: "var(--art-gold)",
  ROAD: "var(--art-road)",
  TORCH: "var(--art-torch)",
};

/** Wide, soft road bed under every edge. */
export const ROAD_BED = "color-mix(in oklch, var(--art-road) 45%, transparent)";

/** Win / loss colour for an edge state, if any. */
export const STATUS: Partial<Record<EdgeArtVisual, string>> = {
  correct: "var(--graph-result-win-fg)",
  wrong: "var(--graph-result-loss-fg)",
};

/** Dotted trail when idle; the board's own colours (and draw animation) once chosen. */
export function roadStyle(visual: EdgeArtVisual, built: EdgeArtStyle = {}): EdgeArtStyle {
  if (visual === "idle" || visual === "dimmed") {
    // Drawn straight on the board, so it uses the page text colour (readable in light and dark).
    return { stroke: "var(--muted-foreground)", width: 1.6, dash: "1 6" };
  }
  const status = STATUS[visual];
  return status ? { ...built, stroke: status, glow: status } : built;
}

/** Label with the node id, under a building. */
export function Plaque({ id, y, rx = 2.5 }: { id: string; y: number; rx?: number }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <rect x={-9} y={-7} width={18} height={14} rx={rx} fill={ART.PAPER} stroke={ART.INK} strokeWidth={1.1} />
      <text y={4} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={ART.INK} fontFamily="var(--font-sans)">
        {id}
      </text>
    </g>
  );
}

export function GroundShadow({ y = 12, rx = 20 }: { y?: number; rx?: number }) {
  return <ellipse cx={0} cy={y} rx={rx} ry={5} fill={ART.SHADE} opacity={0.25} />;
}

/** Ground marker under a node: dashed when it can be clicked, solid when it is the focus. */
export function Halo({ clickable, focused, y = 1 }: { clickable: boolean; focused: boolean; y?: number }) {
  if (!clickable && !focused) {
    return null;
  }
  return (
    <ellipse
      cx={0}
      cy={y}
      rx={24}
      ry={8}
      fill={focused ? ART.GOLD : "none"}
      fillOpacity={focused ? 0.35 : 0}
      stroke={focused ? ART.GOLD : "var(--foreground)"}
      strokeWidth={focused ? 2 : 1.5}
      strokeDasharray={focused ? undefined : "3 3"}
    />
  );
}
