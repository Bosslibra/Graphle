import { Graph, GraphEdge } from "@/lib/graph/types";

type Adjacency = Record<string, { to: string; w: number }[]>;

/** Adjacency list; neighbours sorted alphabetically for deterministic visits. */
export function adjacency(graph: Graph): Adjacency {
  const adj: Adjacency = {};
  graph.nodes.forEach((n) => (adj[n.id] = []));
  graph.edges.forEach((e) => {
    adj[e.source].push({ to: e.target, w: e.weight });
    adj[e.target].push({ to: e.source, w: e.weight });
  });
  Object.values(adj).forEach((list) => list.sort((a, b) => a.to.localeCompare(b.to)));
  return adj;
}

/** Dijkstra shortest path between two nodes. */
export function dijkstra(graph: Graph, source: string, target: string): { path: string[]; cost: number } {
  const adj = adjacency(graph);
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const unvisited = new Set(graph.nodes.map((n) => n.id));

  graph.nodes.forEach((n) => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
  });
  dist[source] = 0;

  while (unvisited.size > 0) {
    const current = [...unvisited].reduce((a, b) => (dist[a] <= dist[b] ? a : b));
    if (dist[current] === Infinity) break;
    unvisited.delete(current);
    if (current === target) break;

    for (const { to, w } of adj[current]) {
      if (dist[current] + w < dist[to]) {
        dist[to] = dist[current] + w;
        prev[to] = current;
      }
    }
  }

  const path: string[] = [];
  for (let c: string | null = target; c; c = prev[c]) path.unshift(c);
  return { path, cost: dist[target] };
}

/** Union–find, used by Kruskal and spanning-tree checks. */
function createUnionFind(ids: string[]) {
  const parent: Record<string, string> = {};
  ids.forEach((id) => (parent[id] = id));
  const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  return {
    find,
    /** Returns false if a and b were already connected (the edge would close a cycle). */
    union(a: string, b: string): boolean {
      const ra = find(a);
      const rb = find(b);
      if (ra === rb) return false;
      parent[ra] = rb;
      return true;
    },
  };
}

/** Kruskal: minimum spanning tree edges and total weight. */
export function kruskal(graph: Graph): { edges: GraphEdge[]; weight: number } {
  const uf = createUnionFind(graph.nodes.map((n) => n.id));
  const sorted = [...graph.edges].sort((a, b) => a.weight - b.weight || a.id.localeCompare(b.id));
  const edges: GraphEdge[] = [];
  for (const e of sorted) {
    if (uf.union(e.source, e.target)) edges.push(e);
  }
  return { edges, weight: edges.reduce((s, e) => s + e.weight, 0) };
}

/** True when `edges` connect every node with no cycles (n − 1 edges). */
export function isSpanningTree(graph: Graph, edges: GraphEdge[]): boolean {
  if (edges.length !== graph.nodes.length - 1) return false;
  const uf = createUnionFind(graph.nodes.map((n) => n.id));
  return edges.every((e) => uf.union(e.source, e.target));
}

/** Breadth-first visit order from `source`, neighbours in alphabetical order. */
export function bfsOrder(graph: Graph, source: string): string[] {
  const adj = adjacency(graph);
  const order: string[] = [];
  const seen = new Set([source]);
  const queue = [source];
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);
    for (const { to } of adj[current]) {
      if (!seen.has(to)) {
        seen.add(to);
        queue.push(to);
      }
    }
  }
  return order;
}

/** No edge joins two nodes of the same colour, and every node is coloured. */
export function isProperColoring(graph: Graph, colors: Record<string, number | undefined>): boolean {
  if (graph.nodes.some((n) => colors[n.id] === undefined)) return false;
  return graph.edges.every((e) => colors[e.source] !== colors[e.target]);
}

/** Minimum number of colours needed (brute-force backtracking; fine for small graphs). */
export function chromaticNumber(graph: Graph): number {
  const ids = graph.nodes.map((n) => n.id);
  const adj = adjacency(graph);

  const canColor = (k: number) => {
    const colors: Record<string, number> = {};
    const assign = (i: number): boolean => {
      if (i === ids.length) return true;
      const node = ids[i];
      for (let c = 0; c < k; c++) {
        if (adj[node].every(({ to }) => colors[to] !== c)) {
          colors[node] = c;
          if (assign(i + 1)) return true;
          delete colors[node];
        }
      }
      return false;
    };
    return assign(0);
  };

  for (let k = 1; k <= ids.length; k++) {
    if (canColor(k)) return k;
  }
  return ids.length;
}
