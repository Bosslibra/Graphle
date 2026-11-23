"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Graph, GraphEdge } from "@/lib/graph/types";
import { useCurrentSkinVariant } from "@/contexts/site-skin-context";
import { circleLayout, layoutEdgeLabels } from "@/lib/graph/layout";
import { BeadFlare, EdgeWeight } from "@/components/game/edge-label";

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
  const labelStyle = theme.edge.labelStyle;
  const variant = useCurrentSkinVariant();
  const positions = useMemo(() => circleLayout(graph, SVG_SIZE), [graph]);
  const labels = useMemo(
    () => layoutEdgeLabels(positions, graph.edges, { nodeRadius: NODE_RADIUS }),
    [positions, graph.edges],
  );

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
      // Rounded: server and browser trig may differ in the last bits (hydration mismatch).
      out[node.id] = Math.round((start + (end - start) * ratio) * 100) / 100;
    });
    return out;
  }, [graph.nodes, positions, hueStart, hueEnd, theme.hues]);

  const color = (hue: number) => `oklch(${theme.node.lightness} ${theme.node.chroma} ${hue})`;

  return (
    // Square board that fits the space it is given (width and height), via container query units.
    <div className="flex min-h-[180px] w-full flex-1 items-center justify-center" style={{ containerType: "size" }}>
      <div
        className="relative"
        style={{
          width: "min(100cqw, 100cqh)",
          height: "min(100cqw, 100cqh)",
        }}
      >
        <style>{`@keyframes drawEdge { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
          .gb-node:focus-visible .gb-focus { stroke: var(--ring); }
          @keyframes beadIn { from { opacity: 0; } to { opacity: 1; } }
          .gb-edge, .gb-stroke, .gb-line { transition: opacity 0.15s ease, stroke-width 0.15s ease; }
          @media (hover: hover) {
            .gb-edges:has(.gb-edge:hover) .gb-edge:not(:hover) { opacity: 0.3 !important; }
            .gb-edge:hover .gb-stroke { opacity: 1; }
            .gb-edge:hover .gb-line { stroke-width: 4.5px; }
          }`}</style>
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="relative h-full w-full select-none touch-manipulation overflow-visible"
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
                  {/* Several stops so the blend follows the OKLCH hue (SVG would mix in sRGB and go grey). */}
                  {[0, 0.25, 0.5, 0.75, 1].map((k) => (
                    <stop key={k} offset={k} stopColor={color(hues[a] + (hues[b] - hues[a]) * k)} />
                  ))}
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

          <g className="gb-edges">
          {graph.edges.map((edge) => {
            const visual = edgeVisual?.(edge) ?? "idle";
            const lit = visual === "active" || visual === "correct" || visual === "wrong";
            const dir = edgeDirection?.(edge);
            const from = positions[dir?.from ?? edge.source];
            const to = positions[dir?.to ?? edge.target];
            const gradient = `url(#grad-${edge.id}-${dir && dir.from !== edge.source ? "r" : "f"})`;
            const stroke = STATUS_STROKE[visual] ?? (lit ? gradient : theme.edge.inactiveStroke);
            const label = labels[edge.id];
            const lineWidth = lit ? theme.edge.activeStrokeWidth : theme.edge.inactiveStrokeWidth;
            // Solid colour of the line where the label sits (the gradient sampled at the label).
            const lineColor =
              STATUS_STROKE[visual] ??
              (lit
                ? color(hues[edge.source] + (hues[edge.target] - hues[edge.source]) * label.t)
                : theme.edge.inactiveStroke);
            const bead = showWeights && labelStyle === "bead";
            // While a lit edge is being drawn, the bead appears when the stroke reaches it.
            const reach = dir && dir.from !== edge.source ? 1 - label.t : label.t;

            return (
              <g
                key={edge.id}
                onClick={onEdgeClick ? () => onEdgeClick(edge) : undefined}
                className={cn("gb-edge", onEdgeClick && "cursor-pointer")}
                style={{ opacity: visual === "dimmed" ? 0.35 : 1 }}
              >
                {onEdgeClick && (
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="transparent" strokeWidth={18} />
                )}
                {/* Line and bead flare share one opacity, so where they overlap it is not darker. */}
                <g className="gb-stroke" opacity={lit ? 1 : theme.edge.inactiveOpacity}>
                  <line
                    key={`${edge.id}-${visual}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    className="gb-line"
                    pathLength={1}
                    strokeWidth={lineWidth}
                    stroke={stroke}
                    strokeLinecap="round"
                    style={{
                      strokeDasharray: lit ? 1 : undefined,
                      animation: lit ? `drawEdge ${theme.edge.drawDurationMs}ms ease-out forwards` : undefined,
                    }}
                  />
                  {bead && (
                    <BeadFlare
                      key={`${edge.id}-${visual}-bead`}
                      placement={label}
                      lineWidth={lineWidth}
                      color={lineColor}
                      delayMs={lit ? Math.round(theme.edge.drawDurationMs * reach * 0.8) : undefined}
                    />
                  )}
                </g>
                {showWeights && (
                  <EdgeWeight
                    variant={labelStyle}
                    placement={label}
                    weight={edge.weight}
                    lit={lit}
                    fontSize={theme.edge.labelFontSize + 1}
                    colors={{
                      line: lineColor,
                      fill: lit ? lineColor : theme.edge.inactiveLabelFill,
                      stroke: lit ? "transparent" : theme.edge.inactiveLabelStroke,
                      text: lit ? theme.edge.activeLabelText : theme.edge.inactiveLabelText,
                    }}
                  />
                )}
              </g>
            );
          })}
          </g>

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
