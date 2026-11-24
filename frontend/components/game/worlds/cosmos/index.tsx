import { ART, Halo, Plaque, ROAD_BED, roadStyle } from "@/components/game/worlds/common";
import { Antenna, Dome, Drone, FuelCell, Pad, Planet, Rocket, Station } from "@/components/game/worlds/cosmos/shared";
import type { GameArt, MoverArtProps, NodeArtProps, WorldDefinition } from "@/components/game/worlds/types";

/** Plaque below the body, kept within ~1.35r of the node centre. */
const PLAQUE_Y = 22;

/* ---------- Guardie: sentinel drones over landing pads ---------- */

function Outpost({ id, x, y, role }: NodeArtProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform="translate(0 6)">
        <Pad />
      </g>
      {role === "guarded" && (
        <g transform="translate(0 -6)">
          <Drone />
        </g>
      )}
      {role === "missed" && (
        <g transform="translate(0 -6)">
          <Drone ghost />
        </g>
      )}
      {role === "post" && <circle cx={0} cy={-2} r={2.5} fill="none" stroke="var(--muted-foreground)" strokeWidth={1.2} />}
      <Plaque id={id} y={PLAQUE_Y + 2} rx={7} />
    </g>
  );
}

const guards: GameArt = {
  Node: Outpost,
  roadBed: ROAD_BED,
  // Watched lanes are swept by the drones' scanner beam.
  edgeStyle: (visual) =>
    visual === "active" ? { stroke: ART.TORCH, width: 3, glow: ART.TORCH } : roadStyle(visual),
};

/* ---------- Percorso minimo: a rocket burning fuel between planets ---------- */

function World({ id, x, y, role, lit, focused, clickable }: NodeArtProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <Halo clickable={clickable} focused={focused} y={12} />
      {role === "start" ? (
        <Station lit />
      ) : role === "goal" ? (
        <>
          <Planet body="var(--chart-3)" ring="var(--primary)" lights={lit} />
          <line x1={0} y1={-13} x2={0} y2={-24} stroke={ART.INK} strokeWidth={1.2} />
          <path d="M0 -24 L9 -21.5 L0 -19 Z" fill="var(--primary)" stroke={ART.INK} strokeWidth={0.9} />
        </>
      ) : (
        <Planet lights={lit} r={12} />
      )}
      <Plaque id={id} y={PLAQUE_Y} rx={7} />
    </g>
  );
}

function Ship({ x, y, angle }: MoverArtProps) {
  // Flies just above the planet so the plaque stays readable; nose points where it travelled.
  return (
    <g transform={`translate(${x} ${y - 20}) rotate(${angle})`}>
      <Rocket />
    </g>
  );
}

const shortestPath: GameArt = {
  Node: World,
  roadBed: ROAD_BED,
  edgeStyle: (visual) => roadStyle(visual, { width: 3.5 }),
  Weight: FuelCell,
  Mover: Ship,
};

/* ---------- MST: colonies linked by energy relays ---------- */

function Colony({ id, x, y, lit }: NodeArtProps) {
  return (
    <g transform={`translate(${x} ${y + 6})`}>
      <Dome lit={lit} />
      <Plaque id={id} y={PLAQUE_Y - 6 + 2} rx={7} />
    </g>
  );
}

const mst: GameArt = {
  Node: Colony,
  roadBed: ROAD_BED,
  // Built links carry energy.
  edgeStyle: (visual) => roadStyle(visual, { stroke: ART.TORCH, width: 3.5, glow: ART.TORCH }),
  Weight: FuelCell,
};

/* ---------- Colorazione: radio stations sharing frequencies ---------- */

function RadioWorld({ id, x, y, fill }: NodeArtProps) {
  return (
    <g transform={`translate(${x} ${y + 2})`}>
      <Planet body={fill ?? ART.PAPER} dashed={fill === undefined} r={12} />
      <g transform="translate(-4 -10)">
        <Antenna color={fill} />
      </g>
      <Plaque id={id} y={PLAQUE_Y - 2} rx={7} />
    </g>
  );
}

const coloring: GameArt = {
  Node: RadioWorld,
  roadBed: ROAD_BED,
  edgeStyle: (visual) => roadStyle(visual, { width: 2.5 }),
};

function Preview() {
  return (
    <>
      <g fill="var(--foreground)" opacity={0.6}>
        <circle cx={20} cy={10} r={0.9} />
        <circle cx={60} cy={36} r={0.7} />
        <circle cx={150} cy={8} r={1} />
        <circle cx={185} cy={30} r={0.8} />
      </g>
      <path d="M30 34 C 70 10, 120 40, 165 22" stroke={ART.ROAD} strokeWidth={4} fill="none" />
      <path d="M30 34 C 70 10, 120 40, 165 22" stroke={ART.TORCH} strokeWidth={1.5} strokeDasharray="1 4" fill="none" />
      <g transform="translate(30 32) scale(0.7)">
        <Planet r={12} lights />
      </g>
      <g transform="translate(168 22) scale(0.7)">
        <Planet r={12} ring="var(--primary)" body="var(--chart-3)" />
      </g>
      <g transform="translate(100 24) rotate(-15) scale(0.85)">
        <Rocket />
      </g>
    </>
  );
}

export const cosmosWorld: WorldDefinition = {
  id: "cosmos",
  games: { guards, "shortest-path": shortestPath, mst, coloring },
  Preview,
};
