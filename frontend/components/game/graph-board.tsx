"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Graph, GraphEdge } from "@/lib/graph/types";
import { useCurrentSkinVariant } from "@/contexts/site-skin-context";

const NODE_RADIUS = 24;
const SVG_SIZE = 330;

/** How an edge is drawn. */
export type EdgeVisual = "idle" | "active" | "correct" | "wrong" | "dimmed";

export interface GraphBoardProps {
  graph: Graph;
  /** Nodes drawn "lit" (coloured with the skin gradient). */
  activeNodes?: ReadonlySet<string>;
  /** Explicit fill per node (overrides the gradient, e.g. colouring game). */
  nodeFill?: (id: string) => string | undefined;
  /** Small label drawn next to a node (e.g. visit order). */
  nodeBadge?: (id: string) => string | undefined;
  /** Node with a thick ring (e.g. current position). */
  focusNode?: string;
  /** Nodes that react to clicks; all nodes when omitted and onNodeClick is set. */
  clickableNodes?: ReadonlySet<string>;
  /** Hue gradient runs from this node... */
  hueStart?: string;
  /** ...to this one. */
  hueEnd?: string;
  edgeVisual?: (edge: GraphEdge) => EdgeVisual;
  /** Direction used to animate an active edge being drawn. */
  edgeDirection?: (edge: GraphEdge) => { from: string; to: string } | undefined;
  onNodeClick?: (id: string) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
  /** Draw the weight label on each edge. */
  showWeights?: boolean;
  ariaLabel?: string;
}

function circleLayout(graph: Graph) {
  const c = SVG_SIZE / 2;
  const r = SVG_SIZE * 0.36;
  const positions: Record<string, { x: number; y: number }> = {};
  graph.nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / graph.nodes.length - Math.PI / 2;
    positions[node.id] = { x: c + r * Math.cos(angle), y: c + r * Math.sin(angle) };
  });
  return positions;
}

const STATUS_STROKE: Partial<Record<EdgeVisual, string>> = {
  correct: "var(--graph-result-win-fg)",
  wrong: "var(--graph-result-loss-fg)",
};

export default function GraphBoard({
  graph,
  activeNodes,
  nodeFill,
  nodeBadge,
  focusNode,
  clickableNodes,
  hueStart,
  hueEnd,
  edgeVisual,
  edgeDirection,
  onNodeClick,
  onEdgeClick,
  showWeights = true,
  ariaLabel,
}: GraphBoardProps) {
  const theme = useCurrentSkinVariant().graph;
  const variant = useCurrentSkinVariant();
  const positions = useMemo(() => circleLayout(graph), [graph]);

  // Hue of each node: interpolated by distance between hueStart and hueEnd,
  // or by position around the circle when no anchors are given.
  const hues = useMemo(() => {
    const out: Record<string, number> = {};
    const { start, end } = theme.hues;
    graph.nodes.forEach((node, i) => {
      let ratio = i / Math.max(1, graph.nodes.length - 1);
      if (hueStart && hueEnd) {
        const p = positions[node.id];
        const dS = Math.hypot(p.x - positions[hueStart].x, p.y - positions[hueStart].y);
        const dE = Math.hypot(p.x - positions[hueEnd].x, p.y - positions[hueEnd].y);
        ratio = dS + dE === 0 ? 0 : dS / (dS + dE);
      }
      out[node.id] = start + (end - start) * ratio;
    });
    return out;
  }, [graph.nodes, positions, hueStart, hueEnd, theme.hues]);

  const color = (hue: number) => `oklch(${theme.node.lightness} ${theme.node.chroma} ${hue})`;

  return (
    // Square board that fits the space it is given (width and height), via container query units.
    <div className="flex min-h-[180px] w-full flex-1 items-center justify-center" style={{ containerType: "size" }}>
      <div
        className="relative overflow-hidden rounded-xl border"
        style={{
          width: "min(100cqw, 100cqh)",
          height: "min(100cqw, 100cqh)",
          background: "var(--graphle-graph-bg)",
          borderColor: "var(--graph-board-border)",
          transition: "background 0.5s ease, border-color 0.3s ease",
        }}
      >
        <style>{`@keyframes drawEdge { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
          .gb-node:focus-visible .gb-focus { stroke: var(--ring); }`}</style>
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="h-full w-full select-none touch-manipulation"
          role="img"
          aria-label={ariaLabel}
        >
          <defs>
            {graph.edges.flatMap((edge) =>
              [
                [edge.source, edge.target, "f"],
                [edge.target, edge.source, "r"],
              ].map(([a, b, dir]) => (
                <linearGradient
                  key={`${edge.id}-${dir}`}
                  id={`grad-${edge.id}-${dir}`}
                  x1={positions[a].x}
                  y1={positions[a].y}
                  x2={positions[b].x}
                  y2={positions[b].y}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor={color(hues[a])} />
                  <stop offset="100%" stopColor={color(hues[b])} />
                </linearGradient>
              )),
            )}
          </defs>

          {variant.assets?.graphOverlaySvg && (
            <image
              href={variant.assets.graphOverlaySvg}
              x={0}
              y={0}
              width={SVG_SIZE}
              height={SVG_SIZE}
              preserveAspectRatio="none"
              opacity={0.18}
            />
          )}

          {graph.edges.map((edge) => {
            const visual = edgeVisual?.(edge) ?? "idle";
            const lit = visual === "active" || visual === "correct" || visual === "wrong";
            const dir = edgeDirection?.(edge);
            const from = positions[dir?.from ?? edge.source];
            const to = positions[dir?.to ?? edge.target];
            const gradient = `url(#grad-${edge.id}-${dir && dir.from !== edge.source ? "r" : "f"})`;
            const stroke = STATUS_STROKE[visual] ?? (lit ? gradient : theme.edge.inactiveStroke);
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            const labelFill =
              STATUS_STROKE[visual] ??
              (lit ? color((hues[edge.source] + hues[edge.target]) / 2) : theme.edge.inactiveLabelFill);

            return (
              <g
                key={edge.id}
                onClick={onEdgeClick ? () => onEdgeClick(edge) : undefined}
                className={cn(onEdgeClick && "cursor-pointer")}
                style={{ opacity: visual === "dimmed" ? 0.35 : 1 }}
              >
                {onEdgeClick && (
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="transparent" strokeWidth={18} />
                )}
                <line
                  key={`${edge.id}-${visual}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  pathLength={1}
                  strokeWidth={lit ? theme.edge.activeStrokeWidth : theme.edge.inactiveStrokeWidth}
                  stroke={stroke}
                  strokeLinecap="round"
                  style={{
                    opacity: lit ? 1 : theme.edge.inactiveOpacity,
                    strokeDasharray: lit ? 1 : undefined,
                    animation: lit ? `drawEdge ${theme.edge.drawDurationMs}ms ease-out forwards` : undefined,
                  }}
                />
                {showWeights && (<>
                <rect
                  x={mx - 12}
                  y={my - 10}
                  width={24}
                  height={19}
                  rx={5}
                  fill={labelFill}
                  stroke={lit ? "transparent" : theme.edge.inactiveLabelStroke}
                  strokeWidth={1}
                />
                <text
                  x={mx}
                  y={my + 4.5}
                  textAnchor="middle"
                  fontSize={theme.edge.labelFontSize + 1}
                  fontWeight={lit ? 700 : 500}
                  fill={lit ? theme.edge.activeLabelText : theme.edge.inactiveLabelText}
                  fontFamily="var(--font-mono)"
                >
                  {edge.weight}
                </text>
                </>)}
              </g>
            );
          })}

          {graph.nodes.map((node) => {
            const pos = positions[node.id];
            const explicit = nodeFill?.(node.id);
            const lit = explicit !== undefined || activeNodes?.has(node.id);
            const fill = explicit ?? (lit ? color(hues[node.id]) : theme.node.inactiveFill);
            const clickable = !!onNodeClick && (!clickableNodes || clickableNodes.has(node.id));
            const badge = nodeBadge?.(node.id);

            return (
              <g
                key={node.id}
                onClick={clickable ? () => onNodeClick!(node.id) : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onNodeClick!(node.id);
                        }
                      }
                    : undefined
                }
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-label={clickable ? node.id : undefined}
                className={cn("gb-node outline-none", clickable && "cursor-pointer")}
              >
                {clickable && <circle cx={pos.x} cy={pos.y} r={NODE_RADIUS + 10} fill="transparent" />}
                <circle className="gb-focus" cx={pos.x} cy={pos.y} r={NODE_RADIUS + 5} fill="none" stroke="transparent" strokeWidth={3} />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_RADIUS}
                  fill={fill}
                  stroke={lit ? fill : theme.node.inactiveStroke}
                  strokeWidth={focusNode === node.id ? 4 : clickable ? 2.5 : 1.5}
                  className="transition-colors duration-300"
                />
                {focusNode === node.id && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={NODE_RADIUS + 6}
                    fill="none"
                    stroke={fill}
                    strokeOpacity={0.5}
                    strokeWidth={2}
                  />
                )}
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  fontSize={theme.node.labelFontSize}
                  fontWeight={lit ? 700 : 600}
                  fill={lit ? theme.node.activeText : theme.node.inactiveText}
                  fontFamily="var(--font-sans)"
                >
                  {node.id}
                </text>
                {badge && (
                  <g>
                    <circle
                      cx={pos.x + NODE_RADIUS * 0.8}
                      cy={pos.y - NODE_RADIUS * 0.8}
                      r={9}
                      fill="var(--graph-path-chip-bg)"
                      stroke="var(--graph-path-chip-border)"
                    />
                    <text
                      x={pos.x + NODE_RADIUS * 0.8}
                      y={pos.y - NODE_RADIUS * 0.8 + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={700}
                      fill="var(--graph-path-chip-fg)"
                      fontFamily="var(--font-mono)"
                    >
                      {badge}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
