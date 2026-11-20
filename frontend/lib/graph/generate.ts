import { createRng } from "@/lib/graph/random";
import { Graph, GraphEdge, pairKey } from "@/lib/graph/types";

export interface GenerateOptions {
  nodes?: number;
  /** Number of extra edges added on top of the spanning tree. Defaults to `nodes`. */
  extraEdges?: number;
  minWeight?: number;
  maxWeight?: number;
}

const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Random connected, weighted, undirected graph.
 * 1. Build a random spanning tree (guarantees connectivity).
 * 2. Add extra random edges so there is something to think about.
 * Port of backend/app/service/mst.py:generate_graph, made deterministic per seed.
 * Node ids are sorted so labels read A, B, C… around the board.
 */
export function generateGraph(seed: string, options: GenerateOptions = {}): Graph {
  const { nodes: n = 6, minWeight = 1, maxWeight = 15 } = options;
  const extraEdges = options.extraEdges ?? n;
  const rng = createRng(seed);

  const labels = LABELS.slice(0, n);
  const edges: GraphEdge[] = [];
  const existing = new Set<string>();

  const addEdge = (source: string, target: string) => {
    edges.push({
      id: `e${edges.length + 1}`,
      source,
      target,
      weight: rng.int(minWeight, maxWeight),
    });
    existing.add(pairKey(source, target));
  };

  const order = rng.shuffle([...labels]);
  const connected = [order[0]];
  for (const node of order.slice(1)) {
    addEdge(node, rng.pick(connected));
    connected.push(node);
  }

  const maxEdges = (n * (n - 1)) / 2;
  let needed = Math.min(extraEdges, maxEdges - edges.length);
  let attempts = 0;
  while (needed > 0 && attempts < 200) {
    attempts++;
    const [u, v] = rng.sample(labels, 2);
    if (!existing.has(pairKey(u, v))) {
      addEdge(u, v);
      needed--;
    }
  }

  return { nodes: labels.map((id) => ({ id })), edges, seed };
}
