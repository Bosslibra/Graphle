"use client";

import { Fragment, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Edge, GameStatus, GraphResponse } from "@/components/game/types";
import {
  getGraphBoardTheme,
  GraphBoardThemeId,
} from "@/components/game/board-themes";

const NODE_RADIUS = 22;
const SVG_SIZE = 380;

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
  themeId?: GraphBoardThemeId;
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
  themeId,
  onNodeClick,
}: GraphBoardProps) {
  const theme = useMemo(() => getGraphBoardTheme(themeId), [themeId]);

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
        hues[node.id] = theme.hues.start;
        return;
      }

      if (node.id === targetNode) {
        hues[node.id] = theme.hues.end;
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
      hues[node.id] = theme.hues.start + (theme.hues.end - theme.hues.start) * ratio;
    });

    return hues;
  }, [graph.nodes, positions, sourceNode, targetNode, theme.hues.end, theme.hues.start]);

  const getColor = useCallback(
    (hue: number) => `oklch(${theme.node.lightness} ${theme.node.chroma} ${hue})`,
    [theme.node.chroma, theme.node.lightness],
  );

  const selectedEdgeKeys = useMemo(() => {
    const keys = new Set<string>();

    for (let i = 0; i < selected.length - 1; i++) {
      const a = selected[i];
      const b = selected[i + 1];
      keys.add([a, b].sort().join("::"));
    }

    return keys;
  }, [selected]);

  const selectedEdgeDirection = useMemo(() => {
    const direction = new Map<string, { from: string; to: string }>();

    for (let i = 0; i < selected.length - 1; i++) {
      const from = selected[i];
      const to = selected[i + 1];
      direction.set([from, to].sort().join("::"), { from, to });
    }

    return direction;
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
              <Fragment key={`grad-${edge.id}`}>
                <linearGradient
                  key={`grad-${edge.id}-forward`}
                  id={`grad-${edge.id}-forward`}
                  x1={positions[edge.source].x}
                  y1={positions[edge.source].y}
                  x2={positions[edge.target].x}
                  y2={positions[edge.target].y}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor={getColor(nodeHues[edge.source])} />
                  <stop offset="100%" stopColor={getColor(nodeHues[edge.target])} />
                </linearGradient>
                <linearGradient
                  key={`grad-${edge.id}-reverse`}
                  id={`grad-${edge.id}-reverse`}
                  x1={positions[edge.target].x}
                  y1={positions[edge.target].y}
                  x2={positions[edge.source].x}
                  y2={positions[edge.source].y}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor={getColor(nodeHues[edge.target])} />
                  <stop offset="100%" stopColor={getColor(nodeHues[edge.source])} />
                </linearGradient>
              </Fragment>
            ))}
          </defs>

          {graph.edges.map((edge) => {
            const s = positions[edge.source];
            const t = positions[edge.target];
            const inUser = isEdgeInUserPath(edge);
            const inBest = showBestPath && isEdgeInBestPath(edge);
            const traversedDirection = selectedEdgeDirection.get(
              [edge.source, edge.target].sort().join("::"),
            );

            const lineStart =
              inUser && traversedDirection ? positions[traversedDirection.from] : s;
            const lineEnd = inUser && traversedDirection ? positions[traversedDirection.to] : t;
            const gradientId =
              inUser && traversedDirection
                ? edge.source === traversedDirection.from
                  ? `grad-${edge.id}-forward`
                  : `grad-${edge.id}-reverse`
                : `grad-${edge.id}-forward`;

            const mx = (s.x + t.x) / 2;
            const my = (s.y + t.y) / 2;
            const midHue = (nodeHues[edge.source] + nodeHues[edge.target]) / 2;
            const lineKey = `${edge.id}-${inUser ? "user" : inBest ? "best" : "default"}`;

            return (
              <g key={edge.id}>
                <line
                  key={lineKey}
                  x1={lineStart.x}
                  y1={lineStart.y}
                  x2={lineEnd.x}
                  y2={lineEnd.y}
                  pathLength={1}
                  strokeWidth={
                    inUser || inBest
                      ? theme.edge.activeStrokeWidth
                      : theme.edge.inactiveStrokeWidth
                  }
                  stroke={inUser || inBest ? `url(#${gradientId})` : theme.edge.inactiveStroke}
                  className={cn(
                    "transition-all duration-200",
                    (inUser || inBest) && "animate-draw",
                  )}
                  style={{
                    opacity: inUser || inBest ? 1 : theme.edge.inactiveOpacity,
                    strokeDasharray: inUser || inBest ? 1 : undefined,
                    animation:
                      inUser || inBest
                        ? `drawEdge ${theme.edge.drawDurationMs}ms ease-out forwards`
                        : undefined,
                  }}
                />
                <rect
                  x={mx - 10}
                  y={my - 9}
                  width={20}
                  height={16}
                  rx={4}
                  fill={inUser || inBest ? getColor(midHue) : theme.edge.inactiveLabelFill}
                  stroke={inUser || inBest ? "transparent" : theme.edge.inactiveLabelStroke}
                  strokeWidth={1}
                  className="transition-colors duration-200"
                />
                <text
                  x={mx}
                  y={my + 3}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={inUser || inBest ? "700" : "500"}
                  fill={
                    inUser || inBest
                      ? theme.edge.activeLabelText
                      : theme.edge.inactiveLabelText
                  }
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

            let nodeColor = theme.node.inactiveFill;
            let strokeColor = theme.node.inactiveStroke;
            let textColor = theme.node.inactiveText;

            if (isSelected || isSource || isTarget) {
              nodeColor = getColor(nodeHues[node.id]);
              strokeColor = nodeColor;
              textColor = theme.node.activeText;
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
