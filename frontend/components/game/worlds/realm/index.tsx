import type { GameArt, NodeArtProps, WorldDefinition } from "@/components/game/worlds/types";
import {
  ART,
  Castle,
  Coin,
  Guard,
  GroundShadow,
  Halo,
  House,
  Messenger,
  Plaque,
  ROAD_BED,
  Stand,
  roadStyle,
} from "@/components/game/worlds/realm/shared";

/** Buildings sit a bit below the node centre so building + plaque stay within ~1.35r. */
const BASE = 8;
const PLAQUE_Y = 14;

/* ---------- Guardie: guard posts on a crossroads ---------- */

function GuardPost({ id, x, y, role }: NodeArtProps) {
  return (
    <g transform={`translate(${x} ${y + 4}) scale(1.12)`}>
      <GroundShadow y={14} rx={17} />
      <Stand />
      {role === "guarded" && <Guard />}
      {role === "missed" && <Guard ghost />}
      {role === "post" && (
        // Empty stand: a small pennant waiting for its guard.
        <g stroke="var(--muted-foreground)" strokeWidth={1.2}>
          <line x1={0} y1={0} x2={0} y2={-16} />
          <path d="M0 -16 L8 -13.5 L0 -11 Z" fill={ART.PAPER} />
        </g>
      )}
      <Plaque id={id} y={PLAQUE_Y + 9} />
    </g>
  );
}

const guards: GameArt = {
  Node: GuardPost,
  roadBed: ROAD_BED,
  // Roads watched by a guard are lit by torches.
  edgeStyle: (visual) =>
    visual === "active" ? { stroke: ART.TORCH, width: 4, glow: ART.TORCH } : roadStyle(visual),
};

/* ---------- Percorso minimo: towns, tolls and a messenger ---------- */

function Town({ id, x, y, role, lit, focused, clickable }: NodeArtProps) {
  return (
    <g transform={`translate(${x} ${y + BASE})`}>
      <Halo clickable={clickable} focused={focused} />
      <GroundShadow y={1} />
      {role === "goal" ? (
        <Castle flag="var(--primary)" lit={lit} />
      ) : role === "start" ? (
        <Castle flag={ART.GOLD} lit />
      ) : (
        <>
          <House lit={lit} x={-6} scale={0.85} />
          <House lit={lit} x={7} scale={0.7} />
        </>
      )}
      <Plaque id={id} y={PLAQUE_Y} />
    </g>
  );
}

function Rider({ x, y, facingLeft }: { x: number; y: number; facingLeft: boolean }) {
  // Stands just above the town so the plaque stays readable.
  return (
    <g transform={`translate(${x} ${y - 10}) scale(${facingLeft ? -1 : 1} 1)`}>
      <Messenger />
    </g>
  );
}

const shortestPath: GameArt = {
  Node: Town,
  roadBed: ROAD_BED,
  edgeStyle: (visual) => roadStyle(visual, { width: 4.5 }),
  Weight: Coin,
  Mover: Rider,
};

/* ---------- MST: villages to connect with paved roads ---------- */

function Village({ id, x, y, lit }: NodeArtProps) {
  return (
    <g transform={`translate(${x} ${y + BASE})`}>
      <GroundShadow y={1} />
      <House lit={lit} />
      {lit && (
        // Chimney smoke: the village is connected.
        <path
          d="M6 -22 C3 -26 9 -28 6 -32 C3 -35 8 -37 6 -40"
          fill="none"
          stroke={ART.INK}
          strokeOpacity={0.35}
          strokeWidth={1.3}
          strokeLinecap="round"
        />
      )}
      <Plaque id={id} y={PLAQUE_Y} />
    </g>
  );
}

const mst: GameArt = {
  Node: Village,
  roadBed: ROAD_BED,
  // Built roads are paved stone.
  edgeStyle: (visual) => roadStyle(visual, { stroke: ART.SHADE, width: 6 }),
  Weight: Coin,
};

/* ---------- Colorazione: castles raising banners ---------- */

function Keep({ id, x, y, fill }: NodeArtProps) {
  return (
    <g transform={`translate(${x} ${y + BASE})`}>
      <GroundShadow y={1} />
      <Castle flag={fill ?? ART.PAPER} lit={fill !== undefined} />
      {/* Big banner on the wall in the chosen colour (the number badge stays for colour-blind players). */}
      <path
        d="M-6 -14 H6 V-6 L0 -2 L-6 -6 Z"
        fill={fill ?? ART.PAPER}
        stroke={ART.INK}
        strokeWidth={1.1}
        strokeLinejoin="round"
        strokeDasharray={fill ? undefined : "2 1.5"}
      />
      <Plaque id={id} y={PLAQUE_Y} />
    </g>
  );
}

const coloring: GameArt = {
  Node: Keep,
  roadBed: ROAD_BED,
  edgeStyle: (visual) => roadStyle(visual, { width: 3 }),
};

export const realmWorld: WorldDefinition = {
  id: "realm",
  games: { guards, "shortest-path": shortestPath, mst, coloring },
};
