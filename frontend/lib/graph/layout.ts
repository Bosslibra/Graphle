import type { Graph, GraphEdge } from "@/lib/graph/types";

export interface Point {
  x: number;
  y: number;
}

export interface EdgeLabelPlacement {
  x: number;
  y: number;
  /** Rotation in degrees that aligns the label with its edge, kept upright (-90..90]. */
  angle: number;
  /** Position along the edge, 0 = source, 1 = target. */
  t: number;
}

export interface LabelLayoutOptions {
  nodeRadius: number;
  /** Desired free space between two label centres. */
  labelGap?: number;
  /** Desired distance between a label centre and any other edge. */
  lineGap?: number;
}

/**
 * Rounds to 2 decimals. Server (Node) and browser trig can differ in the last bits
 * (59.99999 vs 60.00001), which would make the SVG attributes differ at hydration.
 */
const round = (n: number) => Math.round(n * 100) / 100;

/** Nodes evenly spaced on a circle inside a `size` x `size` square, first node at the top. */
export function circleLayout(graph: Pick<Graph, "nodes">, size: number): Record<string, Point> {
  const c = size / 2;
  const r = size * 0.36;
  const positions: Record<string, Point> = {};
  graph.nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / graph.nodes.length - Math.PI / 2;
    positions[node.id] = { x: round(c + r * Math.cos(angle)), y: round(c + r * Math.sin(angle)) };
  });
  return positions;
}

/** Positions along the edge that are tried, nearest to the middle first. */
const CANDIDATES = [0.5, 0.44, 0.56, 0.38, 0.62, 0.32, 0.68, 0.27, 0.73];

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function uprightAngle(a: Point, b: Point): number {
  let angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  if (angle > 90) angle -= 180;
  if (angle <= -90) angle += 180;
  return round(angle);
}

/**
 * Places each weight label on its own edge, sliding it away from the middle when the middle is
 * crowded (other labels, crossing edges, nodes). Labels of edges that cross at the same point
 * (e.g. diameters of the circle layout) would otherwise sit on top of each other.
 */
export function layoutEdgeLabels(
  positions: Record<string, Point>,
  edges: readonly GraphEdge[],
  { nodeRadius, labelGap = 30, lineGap = 15 }: LabelLayoutOptions,
): Record<string, EdgeLabelPlacement> {
  const nodes = Object.values(positions);
  const segments = edges.map((e) => ({ id: e.id, a: positions[e.source], b: positions[e.target] }));
  const placed: Record<string, EdgeLabelPlacement> = {};

  // Short edges have the least room to move, so they choose first.
  const order = [...segments].sort(
    (s, t) => Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y) - Math.hypot(t.b.x - t.a.x, t.b.y - t.a.y),
  );

  for (const seg of order) {
    let best: { p: Point; t: number; cost: number } | null = null;

    for (const t of CANDIDATES) {
      const p = { x: seg.a.x + (seg.b.x - seg.a.x) * t, y: seg.a.y + (seg.b.y - seg.a.y) * t };

      const dNode = Math.min(...nodes.map((n) => Math.hypot(p.x - n.x, p.y - n.y) - nodeRadius));
      if (dNode < 12) continue; // would cover a node

      const dLabel = Math.min(
        Infinity,
        ...Object.values(placed).map((l) => Math.hypot(p.x - l.x, p.y - l.y)),
      );
      const dLine = Math.min(
        Infinity,
        ...segments.filter((s) => s.id !== seg.id).map((s) => distanceToSegment(p, s.a, s.b)),
      );

      const cost =
        Math.max(0, labelGap - dLabel) * 4 + // overlapping labels: worst case
        Math.max(0, lineGap - dLine) * 2 + // sitting on another edge: ambiguous
        Math.max(0, 18 - dNode) +
        Math.abs(t - 0.5) * 12; // otherwise prefer the middle

      if (!best || cost < best.cost) best = { p, t, cost };
    }

    const t = best?.t ?? 0.5;
    const p = best?.p ?? { x: (seg.a.x + seg.b.x) / 2, y: (seg.a.y + seg.b.y) / 2 };
    placed[seg.id] = { x: round(p.x), y: round(p.y), angle: uprightAngle(seg.a, seg.b), t };
  }

  return placed;
}
