/**
 * SVG pieces for the "Cosmo" world, drawn around (0, 0). Colours come only from CSS variables, so
 * they follow the skin in light and dark mode.
 */
import { ART, STATUS } from "@/components/game/worlds/common";
import type { WeightArtProps } from "@/components/game/worlds/types";

const { INK, PAPER, SHADE, GOLD, TORCH } = ART;
const STROKE = 1.2;
const FLAME = "oklch(0.75 0.18 55)";

/** Two halves of a tilted ring, so the planet can sit between them. */
function RingHalf({ r, front, color }: { r: number; front: boolean; color: string }) {
  const a = r * 1.65;
  const b = r * 0.42;
  return (
    <path
      d={`M ${-a} 0 A ${a} ${b} 0 0 ${front ? 0 : 1} ${a} 0`}
      transform="rotate(-18)"
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  );
}

/**
 * Planet with a shaded night side. `lights`: city lights on the night side (visited / connected).
 * `ring`: colour of a tilted ring, if any.
 */
export function Planet({
  r = 13,
  body = SHADE,
  ring,
  lights = false,
  dashed = false,
}: {
  r?: number;
  body?: string;
  ring?: string;
  lights?: boolean;
  dashed?: boolean;
}) {
  return (
    <g>
      {ring && <RingHalf r={r} front={false} color={ring} />}
      <circle
        r={r}
        fill={body}
        stroke={dashed ? "var(--foreground)" : INK}
        strokeWidth={STROKE}
        strokeDasharray={dashed ? "2.5 2" : undefined}
      />
      {!dashed && (
        <>
          {/* Night side. */}
          <path d={`M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${r * 0.55} ${r} 0 0 0 0 ${-r} Z`} fill={INK} opacity={0.28} />
          {/* Craters / bands. */}
          <circle cx={-r * 0.4} cy={-r * 0.3} r={r * 0.18} fill={INK} opacity={0.15} />
          <circle cx={-r * 0.15} cy={r * 0.45} r={r * 0.12} fill={INK} opacity={0.15} />
        </>
      )}
      {lights && (
        <g fill={GOLD}>
          <circle cx={r * 0.45} cy={-r * 0.25} r={1.2} />
          <circle cx={r * 0.6} cy={r * 0.15} r={1} />
          <circle cx={r * 0.3} cy={r * 0.5} r={1.1} />
        </g>
      )}
      {ring && <RingHalf r={r} front color={ring} />}
    </g>
  );
}

/** Orbital station: hub, ring and two solar panels. */
export function Station({ lit }: { lit: boolean }) {
  return (
    <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
      <rect x={-24} y={-5} width={11} height={10} fill={SHADE} />
      <rect x={13} y={-5} width={11} height={10} fill={SHADE} />
      <path d="M-24 0 H-13 M13 0 H24 M-18.5 -5 V5 M18.5 -5 V5" strokeWidth={0.7} />
      <line x1={-13} y1={0} x2={13} y2={0} strokeWidth={2} />
      <ellipse rx={11} ry={11} fill="none" stroke={PAPER} strokeWidth={4} />
      <ellipse rx={11} ry={11} fill="none" />
      <circle r={5.5} fill={PAPER} />
      <circle r={2.2} fill={lit ? GOLD : INK} stroke="none" />
    </g>
  );
}

/** Colony dome on a small base. `lit`: windows on and a beacon on the antenna. */
export function Dome({ lit }: { lit: boolean }) {
  return (
    <g stroke={INK} strokeWidth={STROKE} strokeLinejoin="round">
      <line x1={9} y1={-12} x2={9} y2={-22} />
      <circle cx={9} cy={-23} r={1.8} fill={lit ? TORCH : PAPER} />
      <path d="M-15 0 A 15 14 0 0 1 15 0 Z" fill={PAPER} fillOpacity={0.9} />
      <path d="M-8 -11 A 15 14 0 0 1 4 -13.6" fill="none" stroke={PAPER} strokeWidth={1.6} strokeOpacity={0.9} />
      <rect x={-18} y={0} width={36} height={5} rx={2} fill={SHADE} />
      <g fill={lit ? GOLD : INK} stroke="none" opacity={lit ? 1 : 0.3}>
        <rect x={-8} y={-6} width={4} height={4} rx={1} />
        <rect x={-1} y={-8} width={4} height={6} rx={1} />
        <rect x={6} y={-6} width={4} height={4} rx={1} />
      </g>
    </g>
  );
}

/** Landing pad with rim lights; top at y = 0. */
export function Pad() {
  return (
    <g>
      <ellipse cx={0} cy={4} rx={18} ry={6} fill={SHADE} stroke={INK} strokeWidth={STROKE} />
      <ellipse cx={0} cy={3} rx={10} ry={3} fill="none" stroke={PAPER} strokeOpacity={0.6} strokeWidth={1} />
      <g fill={GOLD}>
        <circle cx={-15} cy={4} r={1.2} />
        <circle cx={15} cy={4} r={1.2} />
        <circle cx={0} cy={9.4} r={1.2} />
      </g>
    </g>
  );
}

/**
 * Sentinel drone hovering above a pad; centre at (0, 0).
 * `ghost`: dashed outline only (the drone that should have been there).
 */
export function Drone({ ghost = false }: { ghost?: boolean }) {
  const line = ghost
    ? { fill: "none", stroke: "var(--graph-result-loss-fg)", strokeDasharray: "2 2", strokeWidth: 1.3 }
    : { stroke: INK, strokeWidth: STROKE };
  const fill = (c: string) => (ghost ? "none" : c);
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* Panels. */}
      <rect x={-21} y={-4} width={8} height={8} rx={1} {...line} fill={fill(SHADE)} />
      <rect x={13} y={-4} width={8} height={8} rx={1} {...line} fill={fill(SHADE)} />
      <path d="M-13 0 H-9 M9 0 H13" {...line} />
      {/* Antenna. */}
      <path d="M0 -10 V-16" {...line} />
      <circle cx={0} cy={-17} r={1.6} {...line} fill={fill(TORCH)} />
      {/* Body and visor. */}
      <circle r={10} {...line} fill={fill(PAPER)} />
      <rect x={-7} y={-3.5} width={14} height={6} rx={3} {...line} fill={fill(INK)} />
      {!ghost && <circle cx={2} cy={-0.5} r={2} fill={TORCH} />}
    </g>
  );
}

/** Fuel cell with the weight (fuel cost, link cost). */
export function FuelCell({ x, y, weight, lit, visual }: WeightArtProps) {
  const status = STATUS[visual];
  return (
    <g transform={`translate(${x} ${y})`} opacity={visual === "dimmed" ? 0.45 : 1}>
      <rect x={10.5} y={-3} width={2.5} height={6} rx={1} fill={INK} />
      <rect x={-11} y={-7.5} width={22} height={15} rx={3.5} fill={PAPER} stroke={status ?? INK} strokeWidth={status ? 2 : 1.2} />
      <rect x={-8.5} y={-5} width={4} height={10} rx={1.2} fill={GOLD} opacity={lit ? 1 : 0.55} />
      <text
        x={3}
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

/** Rocket pointing right (rotate it to the travel direction), centred on (0, 0). */
export function Rocket() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M-13 -3 L-21 0 L-13 3 Z" fill={FLAME} opacity={0.9} />
      <path d="M-12 -2 L-17 0 L-12 2 Z" fill={GOLD} />
      <path d="M-8 -5 L-13 -10 L-11 -3 Z M-8 5 L-13 10 L-11 3 Z" fill="var(--primary)" stroke={INK} strokeWidth={1} />
      <path d="M-12 -5 H6 C11 -5 15 -2 17 0 C15 2 11 5 6 5 H-12 Z" fill={PAPER} stroke={INK} strokeWidth={STROKE} />
      <path d="M9 -4.4 C12 -3.6 15 -2 17 0 C15 2 12 3.6 9 4.4 Z" fill="var(--primary)" stroke={INK} strokeWidth={1} />
      <circle cx={2} cy={0} r={2.6} fill={TORCH} stroke={INK} strokeWidth={1} />
    </g>
  );
}

/** Dish antenna sending waves in `color` (radio frequency). */
export function Antenna({ color }: { color?: string }) {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <line x1={0} y1={0} x2={0} y2={-7} stroke={INK} strokeWidth={1.3} />
      <path d="M-5 -10 A 6 6 0 0 0 5 -7" fill={PAPER} stroke={INK} strokeWidth={1.1} />
      {color && (
        <g fill="none" stroke={color} strokeWidth={1.5}>
          <path d="M4 -13 A 5 5 0 0 1 8 -9" />
          <path d="M5 -17 A 9 9 0 0 1 12 -10" />
        </g>
      )}
    </g>
  );
}
