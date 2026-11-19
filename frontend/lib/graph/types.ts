export interface GraphNode {
  id: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  seed: string;
  /** Start node, for games that have one (e.g. shortest path). */
  source?: string;
  /** Target node, for games that have one. */
  target?: string;
}

/** Stable key for an undirected pair of nodes. */
export function pairKey(a: string, b: string): string {
  return a < b ? `${a}::${b}` : `${b}::${a}`;
}

export function findEdge(edges: GraphEdge[], a: string, b: string): GraphEdge | undefined {
  return edges.find(
    (e) => (e.source === a && e.target === b) || (e.source === b && e.target === a),
  );
}
