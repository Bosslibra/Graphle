import type { EdgeLabelStyle } from "@/lib/themes/types";
import type { EdgeLabelPlacement } from "@/lib/graph/layout";

/** Radius of the bead holding the weight. */
const BEAD_R = 11;
/** Length of each flare, from where the line starts widening to the circle. */
const FLARE = 10;
/** Where the flare meets the circle, in degrees from the edge direction (180 = straight back). */
const JOIN_DEG = 142;

/**
 * Outline of line → flare → circle → flare → line, centred on the origin along the x axis.
 * The flares are cubic curves that leave the line tangentially and meet the circle tangentially,
 * so the stroke seems to swell into the bead instead of hitting it.
 */
export function beadPath(lineWidth: number, r = BEAD_R, flare = FLARE): string {
  const h = lineWidth / 2;
  const a = (JOIN_DEG * Math.PI) / 180;
  const px = r * Math.cos(a); // < 0: left join point
  const py = r * Math.sin(a); // > 0: distance from the axis
  // Circle tangent at the join (pointing towards the top of the circle).
  const tx = Math.sin(a);
  const ty = Math.cos(a);
  const k = flare * 0.55;
  const start = r + flare;
  const f = (n: number) => Math.round(n * 100) / 100;

  // Top half, left to right (SVG y grows downwards, so "up" is -y).
  const top = [
    `M ${f(-start)} ${f(-h)}`,
    `C ${f(-(r + flare * 0.45))} ${f(-h)} ${f(px - k * tx)} ${f(-py + k * -ty)} ${f(px)} ${f(-py)}`,
    `A ${r} ${r} 0 0 1 ${f(-px)} ${f(-py)}`,
    `C ${f(-px + k * tx)} ${f(-py + k * -ty)} ${f(r + flare * 0.45)} ${f(-h)} ${f(start)} ${f(-h)}`,
  ];
  // Bottom half, right to left (mirror of the top).
  const bottom = [
    `L ${f(start)} ${f(h)}`,
    `C ${f(r + flare * 0.45)} ${f(h)} ${f(-px + k * tx)} ${f(py + k * ty)} ${f(-px)} ${f(py)}`,
    `A ${r} ${r} 0 0 1 ${f(px)} ${f(py)}`,
    `C ${f(px - k * tx)} ${f(py + k * ty)} ${f(-(r + flare * 0.45))} ${f(h)} ${f(-start)} ${f(h)}`,
    "Z",
  ];
  return [...top, ...bottom].join(" ");
}

interface EdgeLabelColors {
  /** Solid colour of the edge line where the label sits. */
  line: string;
  /** Inside of the label. */
  fill: string;
  /** Outline of the pill (ignored by the bead, whose rim is the line itself). */
  stroke: string;
  text: string;
}

/**
 * The part of a bead that belongs to the line (flares + rim). Render it in the same group as the
 * edge line so they share one opacity and the overlap is not darker.
 */
export function BeadFlare({
  placement,
  lineWidth,
  color,
  delayMs,
}: {
  placement: EdgeLabelPlacement;
  lineWidth: number;
  color: string;
  /** Fade in after this delay (used while the edge is being drawn). */
  delayMs?: number;
}) {
  return (
    <path
      d={beadPath(lineWidth)}
      transform={`translate(${placement.x} ${placement.y}) rotate(${placement.angle})`}
      fill={color}
      style={delayMs !== undefined ? { animation: `beadIn 180ms ease-out ${delayMs}ms both` } : undefined}
    />
  );
}

/** The weight itself: inside of the bead, or the whole pill. The number always stays upright. */
export function EdgeWeight({
  variant,
  placement,
  weight,
  colors,
  lit,
  fontSize,
}: {
  variant: EdgeLabelStyle;
  placement: EdgeLabelPlacement;
  weight: number;
  colors: EdgeLabelColors;
  lit: boolean;
  fontSize: number;
}) {
  return (
    <g transform={`translate(${placement.x} ${placement.y})`}>
      {variant === "bead" ? (
        // Rim = BeadFlare underneath; when lit the bead is solid.
        <circle r={lit ? BEAD_R : BEAD_R - 1.6} fill={lit ? colors.line : colors.fill} />
      ) : (
        <rect
          x={-15}
          y={-9.5}
          width={30}
          height={19}
          rx={9.5}
          transform={`rotate(${placement.angle})`}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={1}
        />
      )}
      <text
        y={4.5}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight={lit ? 700 : 600}
        fill={colors.text}
        fontFamily="var(--font-mono)"
      >
        {weight}
      </text>
    </g>
  );
}
