/**
 * Reusable SVG pieces for the "Regno" world. Every piece is drawn around (0, 0) and coloured only
 * with CSS variables (`--art-*`, `--primary`, palette), so it follows the skin in light and dark mode.
 */
import type { EdgeArtStyle, EdgeArtVisual, WeightArtProps } from "@/components/game/worlds/types";

const INK = "var(--art-ink)";
const PAPER = "var(--art-paper)";
const SHADE = "var(--art-shade)";
const GOLD = "var(--art-gold)";
const STROKE = 1.3;

export const ART = { INK, PAPER, SHADE, GOLD, ROAD: "var(--art-road)", TORCH: "var(--art-torch)" };

/** Wide, soft road bed under every edge. */
export const ROAD_BED = "color-mix(in oklch, var(--art-road) 45%, transparent)";

const STATUS: Partial<Record<EdgeArtVisual, string>> = {
  correct: "var(--graph-result-win-fg)",
  wrong: "var(--graph-result-loss-fg)",
};

/** Footpath when idle; the board's own colours (and draw animation) once chosen. */
export function roadStyle(visual: EdgeArtVisual, built: EdgeArtStyle = {}): EdgeArtStyle {
  if (visual === "idle" || visual === "dimmed") {
    // Drawn straight on the board, so it uses the page text colour (readable in light and dark).
    return { stroke: "var(--muted-foreground)", width: 1.6, dash: "1 6" };
  }
  const status = STATUS[visual];
  return status ? { ...built, stroke: status, glow: status } : built;
}

/** Wooden plaque with the node id, under a building. */
export function Plaque({ id, y }: { id: string; y: number }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <rect x={-9} y={-7} width={18} height={14} rx={2.5} fill={PAPER} stroke={INK} strokeWidth={1.1} />
      <text y={4} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={INK} fontFamily="var(--font-sans)">
        {id}
      </text>
    </g>
  );
}

export function GroundShadow({ y = 12, rx = 20 }: { y?: number; rx?: number }) {
  return <ellipse cx={0} cy={y} rx={rx} ry={5} fill={SHADE} opacity={0.25} />;
}

/** Small house; `lit` turns the window on. */
export function House({ lit, x = 0, scale = 1 }: { lit: boolean; x?: number; scale?: number }) {
  return (
    <g transform={`translate(${x} 0) scale(${scale})`}>
      <path d="M-10 -2 V-14 H10 V-2 Z" fill={PAPER} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M-13 -13 L0 -24 L13 -13 Z" fill={SHADE} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <rect x={-3} y={-11} width={6} height={5} fill={lit ? GOLD : INK} opacity={lit ? 1 : 0.35} />
      <path d="M-3 -2 V-5 H3 V-2" fill="none" stroke={INK} strokeWidth={1} />
    </g>
  );
}

/** Keep with two towers and a flag in `flag` colour. */
export function Castle({ flag, lit }: { flag: string; lit: boolean }) {
  const merlons = "M-18 -14 V-20 H-14 V-17 H-11 V-20 H-7 V-14";
  return (
    <g>
      <path d="M-15 -2 V-14 H15 V-2 Z" fill={PAPER} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d={`${merlons} Z`} fill={PAPER} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d={`${merlons} Z`} transform="translate(25 0)" fill={PAPER} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M-18 -14 V-2 H-7 V-14 Z M7 -14 V-2 H18 V-14 Z" fill={PAPER} stroke={INK} strokeWidth={STROKE} />
      <path d="M-5 -2 V-9 A5 5 0 0 1 5 -9 V-2 Z" fill={lit ? GOLD : INK} stroke={INK} strokeWidth={1} />
      <line x1={0} y1={-14} x2={0} y2={-30} stroke={INK} strokeWidth={1.2} />
      <path d="M0 -30 L11 -27 L0 -24 Z" fill={flag} stroke={INK} strokeWidth={0.9} strokeLinejoin="round" />
    </g>
  );
}

/** Coin with the weight (toll, building cost). */
export function Coin({ x, y, weight, lit, visual }: WeightArtProps) {
  const status = STATUS[visual];
  return (
    <g transform={`translate(${x} ${y})`} opacity={visual === "dimmed" ? 0.45 : 1}>
      <circle r={10.5} fill={GOLD} stroke={status ?? INK} strokeWidth={status ? 2 : 1.2} />
      <circle r={7.8} fill="none" stroke={INK} strokeOpacity={0.35} strokeWidth={0.8} />
      <text
        y={3.8}
        textAnchor="middle"
        fontSize={10.5}
        fontWeight={lit ? 800 : 700}
        fill={INK}
        fontFamily="var(--font-mono)"
      >
        {weight}
      </text>
    </g>
  );
}

/** Wooden watch stand, top at y = 0. */
export function Stand() {
  return (
    <g stroke={SHADE} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <line x1={-11} y1={4} x2={-14} y2={14} />
      <line x1={11} y1={4} x2={14} y2={14} />
      <line x1={-12.5} y1={9.5} x2={12.5} y2={9.5} strokeWidth={1.6} />
      <rect x={-16} y={0} width={32} height={5} rx={1} fill={SHADE} stroke={INK} strokeWidth={STROKE} />
    </g>
  );
}

/**
 * Guard with spear and shield, feet at y = 0.
 * `ghost`: dashed outline only (the guard that should have been there).
 */
export function Guard({ ghost = false, color = "var(--primary)" }: { ghost?: boolean; color?: string }) {
  const outline = ghost
    ? { fill: "none", stroke: "var(--graph-result-loss-fg)", strokeDasharray: "2 2", strokeWidth: 1.3 }
    : { stroke: INK, strokeWidth: STROKE };
  const fill = (c: string) => (ghost ? "none" : c);
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* spear */}
      <line x1={9} y1={-1} x2={9} y2={-31} {...outline} />
      <path d="M9 -35 L11.5 -29.5 L6.5 -29.5 Z" {...outline} fill={fill(GOLD)} />
      {/* legs + tunic */}
      <path d="M-4 0 V-7 H4 V0" {...outline} fill={fill(INK)} />
      <path d="M-7 -6 L-6 -18 H6 L7 -6 Z" {...outline} fill={fill(color)} />
      {/* arm holding the spear */}
      <path d="M5 -15 L9 -13" {...outline} />
      {/* head + helmet */}
      <circle cx={0} cy={-22} r={4.3} {...outline} fill={fill(PAPER)} />
      <path d="M-5 -22.5 A5 5 0 0 1 5 -22.5 Z" {...outline} fill={fill("var(--muted-foreground)")} />
      {/* shield */}
      <path d="M-13 -17 H-3 V-11 C-3 -7.5 -8 -5 -8 -5 C-8 -5 -13 -7.5 -13 -11 Z" {...outline} fill={fill(GOLD)} />
      {!ghost && <path d="M-8 -15.5 V-7.5 M-11.5 -12 H-4.5" stroke={color} strokeWidth={1.6} />}
    </g>
  );
}

/** Messenger on horseback, facing right, hooves at y = 0. */
export function Messenger() {
  return (
    <g stroke={INK} strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round">
      {/* legs */}
      <path d="M-8 -6 L-10 0 M-4 -6 L-3 0 M6 -6 L5 0 M9 -6 L11 0" fill="none" />
      {/* tail */}
      <path d="M-12 -11 C-17 -10 -18 -5 -16 -2" fill="none" strokeWidth={2} />
      {/* body */}
      <ellipse cx={0} cy={-9} rx={12} ry={5} fill={PAPER} />
      {/* neck + head */}
      <path d="M8 -11 L13 -20 L19 -18 L18 -15 L13 -14 L11 -7 Z" fill={PAPER} />
      <path d="M12 -20 L13 -23 L14.5 -20" fill={PAPER} />
      {/* saddle cloth */}
      <path d="M-5 -13 H5 V-7 H-5 Z" fill="var(--primary)" />
      {/* rider */}
      <path d="M-1 -13 L-2 -24 H4 L5 -13 Z" fill="var(--primary)" />
      <circle cx={1} cy={-27.5} r={3.6} fill={PAPER} />
      <path d="M-2.8 -28 A4 4 0 0 1 4.8 -28 Z" fill={SHADE} />
      {/* cape */}
      <path d="M-2 -23 C-7 -20 -9 -16 -8 -13 L-2 -14 Z" fill={SHADE} />
      {/* satchel with the message */}
      <rect x={-6} y={-12} width={4.5} height={4} rx={0.8} fill={GOLD} />
    </g>
  );
}

/** Ground marker under a node: dashed when it can be clicked, solid gold when it is the focus. */
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
      fill={focused ? GOLD : "none"}
      fillOpacity={focused ? 0.35 : 0}
      stroke={focused ? GOLD : "var(--foreground)"}
      strokeWidth={focused ? 2 : 1.5}
      strokeDasharray={focused ? undefined : "3 3"}
    />
  );
}
