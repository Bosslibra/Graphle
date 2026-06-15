"use client";

import type { CSSProperties } from "react";
import { useCurrentSkinVariant } from "@/contexts/site-skin-context";

/**
 * GraphBackground — static SVG graph background for Graphle.
 *
 * - Zero JS, no canvas, no RAF — pure SVG
 * - Reads --foreground OKLCH variable from your globals.css
 * - Adapts to next-themes .dark class automatically
 * - Hub nodes (larger) add visual weight hierarchy
 * - Quadratic distance falloff on edge opacity
 * - Tints with the active board theme hue
 */
export default function GraphBackground() {
  const variant = useCurrentSkinVariant();

  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    >
      <style>{`
        .g-graph {
          --gfg: var(--graph-backdrop-color);
          opacity: var(--graph-backdrop-opacity);
          transition: opacity 0.3s;
        }
        .g-edge {
          stroke: var(--gfg);
          stroke-width: var(--graph-backdrop-edge-width);
          opacity: var(--graph-backdrop-edge-opacity);
          stroke-linecap: round;
          fill: none;
          transition: stroke 0.5s;
        }
        .g-node {
          fill: var(--gfg);
          opacity: var(--graph-backdrop-node-opacity);
          transition: fill 0.5s;
        }
        .g-hub {
          opacity: var(--graph-backdrop-hub-opacity);
        }
      `}</style>

      <g className="g-graph">
        {variant.assets?.graphBackdropSvg && (
          <image
            href={variant.assets.graphBackdropSvg}
            x="0"
            y="0"
            width="1440"
            height="900"
            preserveAspectRatio="xMidYMid slice"
            style={{
              opacity: Number.parseFloat(variant.graph.backdrop.imageOpacity),
              mixBlendMode: variant.graph.backdrop.imageBlendMode as CSSProperties["mixBlendMode"],
            }}
          />
        )}

        {/* ── edges ── */}
        <line x1="129.9" y1="374.5" x2="210.9" y2="462.5" className="g-edge" style={{opacity:0.218}}/>
        <line x1="210.9" y1="462.5" x2="345.9" y2="284.6" className="g-edge" style={{opacity:0.178}}/>
        <line x1="210.9" y1="462.5" x2="345.0" y2="554.1" className="g-edge" style={{opacity:0.201}}/>
        <line x1="345.9" y1="284.6" x2="421.7" y2="458.9" className="g-edge" style={{opacity:0.155}}/>
        <line x1="421.7" y1="458.9" x2="523.0" y2="458.8" className="g-edge" style={{opacity:0.192}}/>
        <line x1="421.7" y1="458.9" x2="345.0" y2="554.1" className="g-edge" style={{opacity:0.166}}/>
        <line x1="523.0" y1="458.8" x2="675.8" y2="561.2" className="g-edge" style={{opacity:0.124}}/>
        <line x1="523.0" y1="458.8" x2="421.7" y2="350.2" className="g-edge" style={{opacity:0.148}}/>
        <line x1="675.8" y1="561.2" x2="744.1" y2="412.7" className="g-edge" style={{opacity:0.138}}/>
        <line x1="675.8" y1="561.2" x2="823.4" y2="502.1" className="g-edge" style={{opacity:0.145}}/>
        <line x1="744.1" y1="412.7" x2="823.4" y2="502.1" className="g-edge" style={{opacity:0.189}}/>
        <line x1="744.1" y1="412.7" x2="862.2" y2="374.3" className="g-edge" style={{opacity:0.162}}/>
        <line x1="823.4" y1="502.1" x2="991.7" y2="503.4" className="g-edge" style={{opacity:0.109}}/>
        <line x1="862.2" y1="374.3" x2="991.7" y2="299.8" className="g-edge" style={{opacity:0.121}}/>
        <line x1="862.2" y1="374.3" x2="991.7" y2="503.4" className="g-edge" style={{opacity:0.118}}/>
        <line x1="991.7" y1="299.8" x2="1100.5" y2="374.1" className="g-edge" style={{opacity:0.155}}/>
        <line x1="991.7" y1="503.4" x2="1100.5" y2="374.1" className="g-edge" style={{opacity:0.132}}/>
        <line x1="991.7" y1="503.4" x2="1100.5" y2="540.8" className="g-edge" style={{opacity:0.148}}/>
        <line x1="1100.5" y1="374.1" x2="1245.3" y2="421.6" className="g-edge" style={{opacity:0.128}}/>
        <line x1="1100.5" y1="540.8" x2="1245.3" y2="421.6" className="g-edge" style={{opacity:0.104}}/>
        <line x1="1245.3" y1="421.6" x2="1384.8" y2="374.2" className="g-edge" style={{opacity:0.139}}/>
        <line x1="1245.3" y1="421.6" x2="1384.8" y2="530.5" className="g-edge" style={{opacity:0.112}}/>
        {/* upper band */}
        <line x1="129.9" y1="152.3" x2="280.6" y2="152.1" className="g-edge" style={{opacity:0.149}}/>
        <line x1="280.6" y1="152.1" x2="421.7" y2="178.4" className="g-edge" style={{opacity:0.131}}/>
        <line x1="421.7" y1="178.4" x2="523.0" y2="152.9" className="g-edge" style={{opacity:0.159}}/>
        <line x1="523.0" y1="152.9" x2="675.8" y2="210.2" className="g-edge" style={{opacity:0.112}}/>
        <line x1="675.8" y1="210.2" x2="744.1" y2="152.7" className="g-edge" style={{opacity:0.144}}/>
        <line x1="744.1" y1="152.7" x2="862.2" y2="178.8" className="g-edge" style={{opacity:0.138}}/>
        <line x1="862.2" y1="178.8" x2="991.7" y2="152.3" className="g-edge" style={{opacity:0.121}}/>
        <line x1="991.7" y1="152.3" x2="1100.5" y2="178.2" className="g-edge" style={{opacity:0.155}}/>
        <line x1="1100.5" y1="178.2" x2="1245.3" y2="210.5" className="g-edge" style={{opacity:0.108}}/>
        <line x1="1245.3" y1="210.5" x2="1384.8" y2="152.4" className="g-edge" style={{opacity:0.119}}/>
        {/* lower band */}
        <line x1="129.9" y1="710.4" x2="280.6" y2="752.8" className="g-edge" style={{opacity:0.138}}/>
        <line x1="280.6" y1="752.8" x2="421.7" y2="710.3" className="g-edge" style={{opacity:0.128}}/>
        <line x1="421.7" y1="710.3" x2="523.0" y2="752.1" className="g-edge" style={{opacity:0.144}}/>
        <line x1="523.0" y1="752.1" x2="675.8" y2="710.5" className="g-edge" style={{opacity:0.115}}/>
        <line x1="675.8" y1="710.5" x2="744.1" y2="816.0" className="g-edge" style={{opacity:0.092}}/>
        <line x1="744.1" y1="816.0" x2="844.1" y2="752.3" className="g-edge" style={{opacity:0.118}}/>
        <line x1="844.1" y1="752.3" x2="991.7" y2="710.4" className="g-edge" style={{opacity:0.104}}/>
        <line x1="991.7" y1="710.4" x2="1100.5" y2="752.8" className="g-edge" style={{opacity:0.138}}/>
        <line x1="1100.5" y1="752.8" x2="1245.3" y2="710.3" className="g-edge" style={{opacity:0.122}}/>
        <line x1="1245.3" y1="710.3" x2="1384.8" y2="752.1" className="g-edge" style={{opacity:0.115}}/>
        {/* vertical bridges */}
        <line x1="129.9" y1="152.3" x2="129.9" y2="374.5" className="g-edge" style={{opacity:0.098}}/>
        <line x1="129.9" y1="374.5" x2="129.9" y2="710.4" className="g-edge" style={{opacity:0.072}}/>
        <line x1="280.6" y1="152.1" x2="345.9" y2="284.6" className="g-edge" style={{opacity:0.118}}/>
        <line x1="421.7" y1="178.4" x2="421.7" y2="350.2" className="g-edge" style={{opacity:0.109}}/>
        <line x1="675.8" y1="210.2" x2="675.8" y2="374.1" className="g-edge" style={{opacity:0.108}}/>
        <line x1="744.1" y1="152.7" x2="744.1" y2="412.7" className="g-edge" style={{opacity:0.088}}/>
        <line x1="1100.5" y1="178.2" x2="1100.5" y2="374.1" className="g-edge" style={{opacity:0.106}}/>
        <line x1="1384.8" y1="152.4" x2="1384.8" y2="374.2" className="g-edge" style={{opacity:0.112}}/>
        <line x1="523.0" y1="752.1" x2="523.0" y2="458.8" className="g-edge" style={{opacity:0.072}}/>
        <line x1="280.6" y1="752.8" x2="345.0" y2="554.1" className="g-edge" style={{opacity:0.098}}/>
        <line x1="1384.8" y1="530.5" x2="1384.8" y2="752.1" className="g-edge" style={{opacity:0.104}}/>

        {/* ── nodes ── */}
        {/* upper band */}
        <circle cx="129.9"  cy="152.3" r="1.8"  className="g-node"/>
        <circle cx="280.6"  cy="152.1" r="2.1"  className="g-node"/>
        <circle cx="421.7"  cy="178.4" r="1.6"  className="g-node"/>
        <circle cx="523.0"  cy="152.9" r="2.3"  className="g-node"/>
        <circle cx="675.8"  cy="210.2" r="1.7"  className="g-node"/>
        <circle cx="744.1"  cy="152.7" r="3.2"  className="g-node g-hub"/>
        <circle cx="862.2"  cy="178.8" r="1.9"  className="g-node"/>
        <circle cx="991.7"  cy="152.3" r="2.0"  className="g-node"/>
        <circle cx="1100.5" cy="178.2" r="1.7"  className="g-node"/>
        <circle cx="1245.3" cy="210.5" r="2.2"  className="g-node"/>
        <circle cx="1384.8" cy="152.4" r="1.8"  className="g-node"/>
        {/* middle band */}
        <circle cx="129.9"  cy="374.5" r="3.5"  className="g-node g-hub"/>
        <circle cx="210.9"  cy="462.5" r="2.5"  className="g-node"/>
        <circle cx="345.9"  cy="284.6" r="1.8"  className="g-node"/>
        <circle cx="345.0"  cy="554.1" r="2.0"  className="g-node"/>
        <circle cx="421.7"  cy="350.2" r="1.6"  className="g-node"/>
        <circle cx="421.7"  cy="458.9" r="2.8"  className="g-node"/>
        <circle cx="523.0"  cy="458.8" r="3.3"  className="g-node g-hub"/>
        <circle cx="675.8"  cy="374.1" r="1.7"  className="g-node"/>
        <circle cx="675.8"  cy="561.2" r="2.1"  className="g-node"/>
        <circle cx="744.1"  cy="412.7" r="3.0"  className="g-node g-hub"/>
        <circle cx="823.4"  cy="502.1" r="2.2"  className="g-node"/>
        <circle cx="862.2"  cy="374.3" r="2.6"  className="g-node"/>
        <circle cx="991.7"  cy="299.8" r="1.8"  className="g-node"/>
        <circle cx="991.7"  cy="503.4" r="2.4"  className="g-node"/>
        <circle cx="1100.5" cy="374.1" r="3.4"  className="g-node g-hub"/>
        <circle cx="1100.5" cy="540.8" r="1.9"  className="g-node"/>
        <circle cx="1245.3" cy="421.6" r="2.3"  className="g-node"/>
        <circle cx="1384.8" cy="374.2" r="3.1"  className="g-node g-hub"/>
        <circle cx="1384.8" cy="530.5" r="1.7"  className="g-node"/>
        {/* lower band */}
        <circle cx="129.9"  cy="710.4" r="2.0"  className="g-node"/>
        <circle cx="280.6"  cy="752.8" r="1.8"  className="g-node"/>
        <circle cx="421.7"  cy="710.3" r="2.4"  className="g-node"/>
        <circle cx="523.0"  cy="752.1" r="1.9"  className="g-node"/>
        <circle cx="675.8"  cy="710.5" r="2.1"  className="g-node"/>
        <circle cx="744.1"  cy="816.0" r="3.0"  className="g-node g-hub"/>
        <circle cx="844.1"  cy="752.3" r="1.7"  className="g-node"/>
        <circle cx="991.7"  cy="710.4" r="2.2"  className="g-node"/>
        <circle cx="1100.5" cy="752.8" r="1.8"  className="g-node"/>
        <circle cx="1245.3" cy="710.3" r="2.0"  className="g-node"/>
        <circle cx="1384.8" cy="752.1" r="1.6"  className="g-node"/>
      </g>
    </svg>
  );
}