import { adjacency, dijkstra, greedyVertexCover, minVertexCover } from "@/lib/graph/algorithms";
import { generateGraph } from "@/lib/graph/generate";
import { findEdge, Graph } from "@/lib/graph/types";

/** Minimum number of nodes on the optimal path (start + ≥2 intermediate nodes + target). */
export const MIN_PATH_NODES = 4;
const MAX_ATTEMPTS = 80;
const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Fewest edges between two nodes, ignoring weights. */
function hopDistance(graph: Graph, from: string, to: string): number {
  const adj = adjacency(graph);
  const dist: Record<string, number> = { [from]: 0 };
  const queue = [from];
  while (queue.length) {
    const current = queue.shift()!;
    if (current === to) return dist[current];
    for (const { to: next } of adj[current]) {
      if (dist[next] === undefined) {
        dist[next] = dist[current] + 1;
        queue.push(next);
      }
    }
  }
  return Infinity;
}

interface Candidate {
  graph: Graph;
  source: string;
  target: string;
  score: number;
  pathNodes: number;
}

/** Best (source, target) pair of a graph: never directly connected, long optimal path, ideally a "trap". */
function bestPair(graph: Graph): Candidate | null {
  let best: Candidate | null = null;
  const ids = graph.nodes.map((n) => n.id);
  for (const source of ids) {
    for (const target of ids) {
      if (source >= target || findEdge(graph.edges, source, target)) continue;
      const { path } = dijkstra(graph, source, target);
      // Trap: the cheapest route uses more edges than the shortest-looking one.
      const trap = path.length - 1 > hopDistance(graph, source, target);
      const score = path.length * 10 + (trap ? 5 : 0);
      if (!best || score > best.score) best = { graph, source, target, score, pathNodes: path.length };
    }
  }
  return best;
}

/**
 * Renames nodes so the source is "A" and the target sits on the opposite side of the circle
 * (the board places nodes around a circle in array order).
 */
function arrange({ graph, source, target }: Candidate, seed: string): Graph {
  const n = graph.nodes.length;
  const targetIndex = Math.floor(n / 2);
  const others = graph.nodes.map((node) => node.id).filter((id) => id !== source && id !== target);
  const order: string[] = [];
  for (let i = 0, o = 0; i < n; i++) {
    order.push(i === 0 ? source : i === targetIndex ? target : others[o++]);
  }
  const rename = Object.fromEntries(order.map((oldId, i) => [oldId, LABELS[i]]));

  return {
    seed,
    nodes: order.map((_, i) => ({ id: LABELS[i] })),
    edges: graph.edges.map((e) => ({ ...e, source: rename[e.source], target: rename[e.target] })),
    source: "A",
    target: LABELS[targetIndex],
  };
}

/**
 * Shortest-path puzzle: start and target are never adjacent and the optimal route
 * passes through at least two other nodes. Deterministic per seed (retries use derived seeds).
 */
export function generateShortestPathPuzzle(seed: string): Graph {
  let fallback: Candidate | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const graph = generateGraph(attempt === 0 ? seed : `${seed}#${attempt}`, { nodes: 7, extraEdges: 5 });
    const pick = bestPair(graph);
    if (!pick) continue;
    if (pick.pathNodes >= MIN_PATH_NODES) return arrange(pick, seed);
    if (!fallback || pick.score > fallback.score) fallback = pick;
  }
  // Practically unreachable; still returns a playable, non-adjacent puzzle.
  return arrange(fallback!, seed);
}

/**
 * Guards (vertex cover) puzzle: prefers graphs where the obvious greedy move
 * (guard the busiest node first) does not reach the optimum. Deterministic per seed.
 */
export function generateGuardsPuzzle(seed: string): Graph {
  let fallback: Graph | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const graph = generateGraph(attempt === 0 ? seed : `${seed}#${attempt}`, { nodes: 8, extraEdges: 4 });
    const best = minVertexCover(graph).length;
    if (greedyVertexCover(graph).length > best) return { ...graph, seed };
    fallback ??= graph;
  }
  return { ...fallback!, seed };
}
