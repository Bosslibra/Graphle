"use client";

import { useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Edge, GameStatus, GraphResponse } from "@/components/game/types";

const NODE_RADIUS = 22;
const SVG_SIZE = 380;
const HUE_START = 190;
const HUE_END = 330;

function getNodePositions(
  nodes: GraphResponse["nodes"],
  width: number,
  height: number,
): Record<string, { x: number; y: number }> {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.36;
  const positions: Record<string, { x: number; y: number }> = {};

  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    positions[node.id] = {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });

  return positions;
}

interface GraphBoardProps {
  graph: GraphResponse;
  sourceNode: string;
  targetNode: string;
  selected: string[];
  status: GameStatus;
  bestPath: string[];
  showBestPath: boolean;
  onNodeClick: (nodeId: string) => void;
}

export default function GraphBoard({
  graph,
  sourceNode,
  targetNode,
  selected,
  status,
  bestPath,
  showBestPath,
  onNodeClick,
}: GraphBoardProps) {
  const positions = useMemo(
    () => getNodePositions(graph.nodes, SVG_SIZE, SVG_SIZE),
    [graph.nodes],
  );

  const nodeHues = useMemo(() => {
    const hues: Record<string, number> = {};
    const srcPos = positions[sourceNode];
    const tgtPos = positions[targetNode];

    graph.nodes.forEach((node) => {
      if (node.id === sourceNode) {
        hues[node.id] = HUE_START;
        return;
      }

      if (node.id === targetNode) {
        hues[node.id] = HUE_END;
        return;
      }

      const dSrc = Math.hypot(
        positions[node.id].x - srcPos.x,
        positions[node.id].y - srcPos.y,
      );
      const dTgt = Math.hypot(
        positions[node.id].x - tgtPos.x,
        positions[node.id].y - tgtPos.y,
      );
      const totalDist = dSrc + dTgt;
      const ratio = totalDist === 0 ? 0 : dSrc / totalDist;
      hues[node.id] = HUE_START + (HUE_END - HUE_START) * ratio;
    });

    return hues;
  }, [graph.nodes, positions, sourceNode, targetNode]);

  const getColor = useCallback((hue: number) => `oklch(0.60 0.18 ${hue})`, []);

  const selectedEdgeKeys = useMemo(() => {
    const keys = new Set<string>();

    for (let i = 0; i < selected.length - 1; i++) {
      const a = selected[i];
      const b = selected[i + 1];
      keys.add([a, b].sort().join("::"));
    }

    return keys;
  }, [selected]);

  const isEdgeInUserPath = useCallback(
    (edge: Edge) => selectedEdgeKeys.has([edge.source, edge.target].sort().join("::")),
    [selectedEdgeKeys],
  );

  const isEdgeInBestPath = useCallback(
    (edge: Edge) => {
      for (let i = 0; i < bestPath.length - 1; i++) {
        const a = bestPath[i];
        const b = bestPath[i + 1];

        if (
          (edge.source === a && edge.target === b) ||
          (edge.source === b && edge.target === a)
        ) {
          return true;
        }
      }

      return false;
    },
    [bestPath],
  );

  const lastSelected = selected[selected.length - 1];

  return (
    <Card className="w-full p-2 overflow-hidden border-muted">
      <CardContent className="p-0">
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          width="100%"
          className="select-none overflow-visible"
        >
          <defs>
            {graph.edges.map((edge) => (
              <linearGradient
                key={`grad-${edge.id}`}
                id={`grad-${edge.id}`}
                x1={positions[edge.source].x}
                y1={positions[edge.source].y}
                x2={positions[edge.target].x}
                y2={positions[edge.target].y}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={getColor(nodeHues[edge.source])} />
                <stop offset="100%" stopColor={getColor(nodeHues[edge.target])} />
              </linearGradient>
            ))}
          </defs>

          {graph.edges.map((edge) => {
            const s = positions[edge.source];
            const t = positions[edge.target];
            const inUser = isEdgeInUserPath(edge);
            const inBest = showBestPath && isEdgeInBestPath(edge);

            const mx = (s.x + t.x) / 2;
            const my = (s.y + t.y) / 2;
            const midHue = (nodeHues[edge.source] + nodeHues[edge.target]) / 2;
            const lineKey = `${edge.id}-${inUser ? "user" : inBest ? "best" : "default"}`;

            return (
              <g key={edge.id}>
                <line
                  key={lineKey}
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  pathLength={1}
                  strokeWidth={inUser || inBest ? 4 : 1.5}
                  stroke={inUser || inBest ? `url(#grad-${edge.id})` : "var(--border)"}
                  className={cn(
                    "transition-all duration-200",
                    (inUser || inBest) && "animate-draw",
                  )}
                  style={{
                    opacity: inUser || inBest ? 1 : 0.4,
                    strokeDasharray: inUser || inBest ? 1 : undefined,
                    animation: inUser || inBest ? "drawEdge 0.35s ease-out forwards" : undefined,
                  }}
                />
                <rect
                  x={mx - 10}
                  y={my - 9}
                  width={20}
                  height={16}
                  rx={4}
                  fill={inUser || inBest ? getColor(midHue) : "var(--card)"}
                  stroke={inUser || inBest ? "transparent" : "var(--border)"}
                  strokeWidth={1}
                  className="transition-colors duration-200"
                />
                <text
                  x={mx}
                  y={my + 3}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={inUser || inBest ? "700" : "500"}
                  fill={inUser || inBest ? "oklch(0.98 0 0)" : "var(--muted-foreground)"}
                  fontFamily="var(--font-mono)"
                  className="transition-colors duration-200"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {graph.nodes.map((node) => {
            const pos = positions[node.id];
            const isSelected = selected.includes(node.id);
            const isSource = node.id === sourceNode;
            const isTarget = node.id === targetNode;
            const isLast = lastSelected === node.id;

            const isNextCandidate =
              status === "playing" &&
              !isSelected &&
              graph.edges.some(
                (edge) =>
                  (edge.source === lastSelected && edge.target === node.id) ||
                  (edge.source === node.id && edge.target === lastSelected),
              );

            let nodeColor = "var(--card)";
            let strokeColor = "var(--border)";
            let textColor = "var(--foreground)";

            if (isSelected || isSource || isTarget) {
              nodeColor = getColor(nodeHues[node.id]);
              strokeColor = nodeColor;
              textColor = "oklch(0.98 0 0)";
            }

            return (
              <g
                key={node.id}
                onClick={() => onNodeClick(node.id)}
                className={cn(
                  "transition-colors duration-300",
                  isNextCandidate && "cursor-pointer",
                  !isNextCandidate && !isLast && status === "playing" && "cursor-default",
                )}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_RADIUS}
                  fill={nodeColor}
                  stroke={strokeColor}
                  strokeWidth={isLast || isNextCandidate ? 3 : 1.5}
                  className="transition-colors duration-300"
                />
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={isSelected || isSource || isTarget ? "700" : "600"}
                  fill={textColor}
                  fontFamily="var(--font-sans)"
                  className="transition-colors duration-300"
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
}
