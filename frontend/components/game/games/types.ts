import type { Graph } from "@/lib/graph/types";

export interface GameResult {
  won: boolean;
  /** Short score shown in results and share text, e.g. "14/14". */
  score: string;
}

export interface GameProps {
  graph: Graph;
  onComplete?: (result: GameResult) => void;
  /** Shown as "New game" after the round ends (practice / timed / challenge). */
  onNewGame?: () => void;
}
