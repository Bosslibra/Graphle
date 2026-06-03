export interface Node {
  id: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface GraphResponse {
  nodes: Node[];
  edges: Edge[];
  seed: string;
}

export type GameStatus = "playing" | "pathCompleted" | "won" | "lost";
