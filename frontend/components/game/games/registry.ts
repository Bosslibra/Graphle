import type { ComponentType } from "react";
import { Palette, Route, Shield, TreePine, type LucideIcon } from "lucide-react";
import ShortestPathGame from "@/components/game/games/shortest-path";
import MstGame from "@/components/game/games/mst";
import ColoringGame from "@/components/game/games/coloring";
import GuardsGame from "@/components/game/games/guards";
import type { GameProps } from "@/components/game/games/types";
import { generateGraph } from "@/lib/graph/generate";
import { generateGuardsPuzzle, generateShortestPathPuzzle } from "@/lib/graph/puzzles";
import type { Graph } from "@/lib/graph/types";

export interface GameDefinition {
  /** URL slug and i18n key (`games.<id>`). */
  id: string;
  icon: LucideIcon;
  /** Used in the daily share text. */
  emoji: string;
  /** Builds the puzzle graph for a seed (deterministic). */
  generate: (seed: string) => Graph;
  Component: ComponentType<GameProps>;
}

/** Single source of truth for the minigames: home, routing and daily share use this list. */
export const GAMES: GameDefinition[] = [
  { id: "shortest-path", icon: Route, emoji: "🛣️", generate: generateShortestPathPuzzle, Component: ShortestPathGame },
  { id: "mst", icon: TreePine, emoji: "🌲", generate: (seed) => generateGraph(seed, { nodes: 6 }), Component: MstGame },
  { id: "coloring", icon: Palette, emoji: "🎨", generate: (seed) => generateGraph(seed, { nodes: 7, extraEdges: 5 }), Component: ColoringGame },
  { id: "guards", icon: Shield, emoji: "💂", generate: generateGuardsPuzzle, Component: GuardsGame },
];

export const MODES = ["daily", "practice", "timed", "challenge"] as const;
export type Mode = (typeof MODES)[number];

export function getGame(id: string): GameDefinition | undefined {
  return GAMES.find((g) => g.id === id);
}

export function isMode(value: string | undefined): value is Mode {
  return MODES.includes(value as Mode);
}
