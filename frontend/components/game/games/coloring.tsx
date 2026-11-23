"use client";

import { useMemo, useState } from "react";
import { useGameText } from "@/components/game/worlds/use-game-text";
import GraphBoard from "@/components/game/graph-board";
import GameShell, { ShellResult } from "@/components/game/game-shell";
import { GameProps } from "@/components/game/games/types";
import { chromaticNumber, isProperColoring } from "@/lib/graph/algorithms";

/** Number of colours offered; their values come from the skin (graph.palette → --graph-palette-N). */
export const PALETTE_SIZE = 5;
const paletteColor = (index: number) => `var(--graph-palette-${index + 1})`;

/** Click a node to cycle its colour; win with a proper colouring that uses the minimum number of colours. */
export default function ColoringGame({ graph, onComplete, onNewGame }: GameProps) {
  const t = useGameText("coloring");
  const chi = useMemo(() => chromaticNumber(graph), [graph]);

  const [colors, setColors] = useState<Record<string, number | undefined>>({});
  const [result, setResult] = useState<ShellResult | null>(null);

  const used = new Set(Object.values(colors).filter((c) => c !== undefined)).size;
  const conflicts = graph.edges.filter(
    (e) => colors[e.source] !== undefined && colors[e.source] === colors[e.target],
  );
  const conflictIds = new Set(conflicts.map((e) => e.id));
  const allColored = graph.nodes.every((n) => colors[n.id] !== undefined);

  function cycle(id: string) {
    setColors((c) => {
      const current = c[id];
      const next = current === undefined ? 0 : current + 1 < PALETTE_SIZE ? current + 1 : undefined;
      return { ...c, [id]: next };
    });
  }

  function reset() {
    setColors({});
    setResult(null);
  }

  function submit() {
    const proper = isProperColoring(graph, colors);
    const won = proper && used === chi;
    setResult({
      won,
      title: won ? t("won") : t("lost"),
      detail: won
        ? t("wonDetail", { used })
        : proper
          ? t("lostDetail", { used, best: chi })
          : t("conflictDetail", { count: conflicts.length, best: chi }),
    });
    onComplete?.({ won, score: `${used}/${chi}` });
  }

  return (
    <GameShell
      info={t("info")}
      stat={t("stat", { used, conflicts: conflicts.length })}
      result={result}
      onReset={reset}
      canSubmit={allColored}
      onSubmit={submit}
      onNewGame={onNewGame}
      footer={Array.from({ length: PALETTE_SIZE }, (_, i) => (
        <span
          key={i}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 text-[11px] font-bold text-[var(--graph-node-text)] shadow-sm transition-opacity"
          style={{ background: paletteColor(i), opacity: Object.values(colors).includes(i) ? 1 : 0.35 }}
          title={t("colorN", { n: i + 1 })}
        >
          {i + 1}
        </span>
      ))}
    >
      <GraphBoard
        graph={graph}
        game="coloring"
        ariaLabel={t("name")}
        showWeights={false}
        nodeFill={(id) => (colors[id] === undefined ? undefined : paletteColor(colors[id]!))}
        nodeBadge={(id) => (colors[id] === undefined ? undefined : String(colors[id]! + 1))}
        onNodeClick={result ? undefined : cycle}
        edgeVisual={(e) => (conflictIds.has(e.id) ? "wrong" : "idle")}
      />
    </GameShell>
  );
}
