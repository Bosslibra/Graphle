import { createRng, dailyNumber, dailySeed, isValidSeed, msUntilNextDaily, utcDateKey } from "@/lib/graph/random";
import { generateGraph } from "@/lib/graph/generate";
import {
  bfsOrder,
  chromaticNumber,
  dijkstra,
  isProperColoring,
  isSpanningTree,
  kruskal,
} from "@/lib/graph/algorithms";
import { generateShortestPathPuzzle, MIN_PATH_NODES } from "@/lib/graph/puzzles";
import { findEdge } from "@/lib/graph/types";
import { circleLayout, layoutEdgeLabels } from "@/lib/graph/layout";
import { Graph } from "@/lib/graph/types";
import { computeStreak } from "@/lib/progress";

/** Small hand-made graph:
 *  A-B 1, B-C 2, A-C 4, C-D 1, B-D 5
 */
const G: Graph = {
  seed: "test",
  nodes: ["A", "B", "C", "D"].map((id) => ({ id })),
  edges: [
    { id: "e1", source: "A", target: "B", weight: 1 },
    { id: "e2", source: "B", target: "C", weight: 2 },
    { id: "e3", source: "A", target: "C", weight: 4 },
    { id: "e4", source: "C", target: "D", weight: 1 },
    { id: "e5", source: "B", target: "D", weight: 5 },
  ],
};

function isConnected(graph: Graph) {
  return bfsOrder(graph, graph.nodes[0].id).length === graph.nodes.length;
}

describe("random", () => {
  test("same seed gives the same sequence", () => {
    const a = createRng("abc");
    const b = createRng("abc");
    expect([a.next(), a.next(), a.int(1, 15)]).toEqual([b.next(), b.next(), b.int(1, 15)]);
  });

  test("int stays within bounds", () => {
    const rng = createRng("bounds");
    for (let i = 0; i < 500; i++) {
      const v = rng.int(1, 15);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(15);
    }
  });

  test("daily seed and number use UTC dates", () => {
    const date = new Date("2026-01-03T23:30:00Z");
    expect(utcDateKey(date)).toBe("2026-01-03");
    expect(dailySeed("mst", date)).toBe("mst-2026-01-03");
    expect(dailyNumber(new Date("2026-01-01T00:00:00Z"))).toBe(1);
    expect(dailyNumber(date)).toBe(3);
    expect(msUntilNextDaily(date)).toBe(30 * 60 * 1000);
  });

  test("seed validation", () => {
    expect(isValidSeed("ABC123")).toBe(true);
    expect(isValidSeed("mst-2026-01-03")).toBe(true);
    expect(isValidSeed("<script>")).toBe(false);
    expect(isValidSeed("")).toBe(false);
    expect(isValidSeed(undefined)).toBe(false);
  });
});

describe("generateGraph", () => {
  test("is deterministic per seed", () => {
    expect(generateGraph("XYZ123")).toEqual(generateGraph("XYZ123"));
    expect(generateGraph("XYZ123")).not.toEqual(generateGraph("XYZ124"));
  });

  test.each(Array.from({ length: 50 }, (_, i) => `seed${i}`))("graph %s is connected and simple", (seed) => {
    const g = generateGraph(seed, { nodes: 7, extraEdges: 5 });
    expect(g.nodes).toHaveLength(7);
    expect(g.edges.length).toBe(6 + 5);
    expect(isConnected(g)).toBe(true);
    const pairs = g.edges.map((e) => [e.source, e.target].sort().join());
    expect(new Set(pairs).size).toBe(pairs.length);
    expect(g.edges.every((e) => e.source !== e.target && e.weight >= 1 && e.weight <= 15)).toBe(true);
  });
});

describe("algorithms", () => {
  test("dijkstra finds the cheapest path", () => {
    expect(dijkstra(G, "A", "D")).toEqual({ path: ["A", "B", "C", "D"], cost: 4 });
  });

  test("kruskal finds the minimum spanning tree", () => {
    const mst = kruskal(G);
    expect(mst.weight).toBe(4);
    expect(mst.edges.map((e) => e.id).sort()).toEqual(["e1", "e2", "e4"]);
  });

  test("isSpanningTree rejects cycles and missing nodes", () => {
    const [e1, e2, e3, e4] = G.edges;
    expect(isSpanningTree(G, [e1, e2, e4])).toBe(true);
    expect(isSpanningTree(G, [e1, e2, e3])).toBe(false); // cycle A-B-C, D left out
    expect(isSpanningTree(G, [e1, e2])).toBe(false);
  });

  test("ties: any minimum tree is valid", () => {
    const square: Graph = {
      seed: "sq",
      nodes: ["A", "B", "C", "D"].map((id) => ({ id })),
      edges: [
        { id: "e1", source: "A", target: "B", weight: 1 },
        { id: "e2", source: "B", target: "C", weight: 1 },
        { id: "e3", source: "C", target: "D", weight: 1 },
        { id: "e4", source: "D", target: "A", weight: 1 },
      ],
    };
    const alternative = [square.edges[1], square.edges[2], square.edges[3]];
    expect(isSpanningTree(square, alternative)).toBe(true);
    expect(alternative.reduce((s, e) => s + e.weight, 0)).toBe(kruskal(square).weight);
  });

  test("bfsOrder visits neighbours alphabetically, level by level", () => {
    expect(bfsOrder(G, "A")).toEqual(["A", "B", "C", "D"]);
    expect(bfsOrder(G, "D")).toEqual(["D", "B", "C", "A"]);
  });

  test("chromatic number and proper colouring", () => {
    // G contains triangle A-B-C → needs 3 colours
    expect(chromaticNumber(G)).toBe(3);
    expect(isProperColoring(G, { A: 0, B: 1, C: 2, D: 0 })).toBe(true);
    expect(isProperColoring(G, { A: 0, B: 0, C: 2, D: 1 })).toBe(false);
    expect(isProperColoring(G, { A: 0, B: 1, C: 2 })).toBe(false);
  });

  test("chromatic number of a tree is 2", () => {
    const path: Graph = { seed: "p", nodes: G.nodes, edges: [G.edges[0], G.edges[1], G.edges[3]] };
    expect(chromaticNumber(path)).toBe(2);
  });
});

describe("shortest path puzzle", () => {
  const seeds = Array.from({ length: 1000 }, (_, i) => `sp${i}`);

  test("is deterministic per seed and keeps the requested seed", () => {
    expect(generateShortestPathPuzzle("ABC123")).toEqual(generateShortestPathPuzzle("ABC123"));
    expect(generateShortestPathPuzzle("ABC123").seed).toBe("ABC123");
  });

  test("start and target are never adjacent and the optimal path has intermediate nodes", () => {
    for (const seed of seeds) {
      const g = generateShortestPathPuzzle(seed);
      expect(g.source).toBe("A");
      expect(findEdge(g.edges, g.source!, g.target!)).toBeUndefined();
      const { path } = dijkstra(g, g.source!, g.target!);
      expect(path.length).toBeGreaterThanOrEqual(MIN_PATH_NODES);
      expect(isConnected(g)).toBe(true);
    }
  });

  test("start and target sit on opposite sides of the board", () => {
    const g = generateShortestPathPuzzle("opposite");
    const n = g.nodes.length;
    expect(g.nodes[0].id).toBe(g.source);
    expect(g.nodes[Math.floor(n / 2)].id).toBe(g.target);
  });

  test("edges reference existing nodes and are not duplicated", () => {
    for (const seed of seeds.slice(0, 100)) {
      const g = generateShortestPathPuzzle(seed);
      const ids = new Set(g.nodes.map((n) => n.id));
      expect(g.edges.every((e) => ids.has(e.source) && ids.has(e.target))).toBe(true);
      const pairs = g.edges.map((e) => [e.source, e.target].sort().join());
      expect(new Set(pairs).size).toBe(pairs.length);
    }
  });
});

describe("streak", () => {
  const today = new Date("2026-03-10T12:00:00Z");
  test("counts consecutive days ending today", () => {
    expect(computeStreak(["2026-03-08", "2026-03-09", "2026-03-10"], today)).toBe(3);
  });
  test("still counts if today is not played yet", () => {
    expect(computeStreak(["2026-03-08", "2026-03-09"], today)).toBe(2);
  });
  test("breaks on a gap", () => {
    expect(computeStreak(["2026-03-06", "2026-03-08"], today)).toBe(0);
    expect(computeStreak([], today)).toBe(0);
  });
});

describe("edge label layout", () => {
  const minLabelDistance = (g: ReturnType<typeof generateGraph>) => {
    const pos = circleLayout(g, 330);
    const labels = Object.values(layoutEdgeLabels(pos, g.edges, { nodeRadius: 24 }));
    let min = Infinity;
    labels.forEach((a, i) => labels.slice(i + 1).forEach((b) => (min = Math.min(min, Math.hypot(a.x - b.x, a.y - b.y)))));
    return min;
  };

  it("never stacks labels of edges that cross at the centre", () => {
    // 6 nodes on a circle: the three diameters share the same midpoint.
    for (let i = 0; i < 300; i++) expect(minLabelDistance(generateGraph(`mst-${i}`, { nodes: 6 }))).toBeGreaterThan(26);
  });

  it("keeps shortest-path labels apart", () => {
    for (let i = 0; i < 300; i++) expect(minLabelDistance(generateShortestPathPuzzle(`sp-${i}`))).toBeGreaterThan(20);
  });

  it("keeps each label on its own edge, upright", () => {
    const g = generateShortestPathPuzzle("labels");
    const pos = circleLayout(g, 330);
    const labels = layoutEdgeLabels(pos, g.edges, { nodeRadius: 24 });
    for (const e of g.edges) {
      const { x, y, angle } = labels[e.id];
      const a = pos[e.source], b = pos[e.target];
      const cross = (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x);
      expect(Math.abs(cross) / Math.hypot(b.x - a.x, b.y - a.y)).toBeLessThan(0.5);
      expect(angle).toBeGreaterThan(-90);
      expect(angle).toBeLessThanOrEqual(90);
    }
  });
});
