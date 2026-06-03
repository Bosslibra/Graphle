import { GraphResponse } from "@/components/game/types";
import { fetchGraphFromRoute } from "@/lib/api/graph";

export async function fetchGraph(seed?: string): Promise<GraphResponse> {
  return fetchGraphFromRoute(seed);
}

export function getDailyPuzzleNumber(date = new Date()): number {
  const start = Date.UTC(2026, 0, 1);
  const now = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((now - start) / 86400000) + 1;
}

export function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}


// Dijkstra's algorithm to find shortest path between two nodes
export function dijkstra(
  nodes: GraphResponse["nodes"],
  edges: GraphResponse["edges"],
  source: string,
  target: string,
): { path: string[]; cost: number } {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const unvisited = new Set(nodes.map((node) => node.id));

  nodes.forEach((node) => {
    dist[node.id] = Infinity;
    prev[node.id] = null;
  });
  dist[source] = 0;

  const adj: Record<string, { to: string; w: number }[]> = {};
  nodes.forEach((node) => {
    adj[node.id] = [];
  });
  edges.forEach((edge) => {
    adj[edge.source].push({ to: edge.target, w: edge.weight });
    adj[edge.target].push({ to: edge.source, w: edge.weight });
  });

  while (unvisited.size > 0) {
    const current = [...unvisited].reduce((a, b) => (dist[a] < dist[b] ? a : b));
    if (dist[current] === Infinity) {
      break;
    }

    unvisited.delete(current);
    if (current === target) {
      break;
    }

    for (const { to, w } of adj[current]) {
      const alt = dist[current] + w;
      if (alt < dist[to]) {
        dist[to] = alt;
        prev[to] = current;
      }
    }
  }

  const path: string[] = [];
  let cursor: string | null = target;
  while (cursor) {
    path.unshift(cursor);
    cursor = prev[cursor];
  }

  return { path, cost: dist[target] };
}