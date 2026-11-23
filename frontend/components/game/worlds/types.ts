import type { ComponentType } from "react";
import type { WorldId } from "@/lib/themes/types";

/** Ids of the minigames (same as `GameDefinition.id`). Kept here to avoid an import cycle. */
export type GameId = "shortest-path" | "mst" | "coloring" | "guards";

/** Same values as `EdgeVisual` in graph-board.tsx. */
export type EdgeArtVisual = "idle" | "active" | "correct" | "wrong" | "dimmed";

export interface NodeArtProps {
  id: string;
  x: number;
  y: number;
  /** Base radius of the node; art may draw up to ~1.35r. */
  r: number;
  /** Game-specific state, e.g. "guarded", "goal", "color-2". */
  role: string;
  /** Fill the game asked for (colouring), if any. */
  fill?: string;
  lit: boolean;
  focused: boolean;
  /** The player can click it now. */
  clickable: boolean;
}

export interface WeightArtProps {
  x: number;
  y: number;
  weight: number;
  lit: boolean;
  visual: EdgeArtVisual;
}

export interface MoverArtProps {
  x: number;
  y: number;
  /** Faces left when it last moved leftwards. */
  facingLeft: boolean;
}

/** How a road looks for a given edge state. Values are CSS colours (use `var(--art-*)`). */
export interface EdgeArtStyle {
  /** Stroke of the line on top. Leave undefined to keep the board's own colour (gradient / status). */
  stroke?: string;
  width?: number;
  /** stroke-dasharray in user units (the board then skips the draw animation). */
  dash?: string;
  /** Soft wide halo under the line (torch light). */
  glow?: string;
}

export interface GameArt {
  /** Replaces the circle + id text. The board keeps hit area, focus ring and keyboard handling. */
  Node?: ComponentType<NodeArtProps>;
  /** Wide road bed drawn under every edge. */
  roadBed?: string;
  edgeStyle?: (visual: EdgeArtVisual) => EdgeArtStyle;
  /** Replaces the weight label (bead / pill). */
  Weight?: ComponentType<WeightArtProps>;
  /** Drawn on top of the node given by the board's `mover` prop; slides in from the previous node. */
  Mover?: ComponentType<MoverArtProps>;
}

export interface WorldDefinition {
  id: WorldId;
  games: Partial<Record<GameId, GameArt>>;
}
