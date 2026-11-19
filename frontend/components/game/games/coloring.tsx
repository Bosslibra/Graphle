"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import GraphBoard from "@/components/game/graph-board";
import GameShell, { ShellResult } from "@/components/game/game-shell";
import { GameProps } from "@/components/game/games/types";
import { chromaticNumber, isProperColoring } from "@/lib/graph/algorithms";

/** Palette used by the colouring game (distinct hues, readable in both themes). */
export const PALETTE = [
  "oklch(0.68 0.19 25)",
  "oklch(0.66 0.15 250)",
  "oklch(0.72 0.17 150)",
  "oklch(0.82 0.16 90)",
  "oklch(0.62 0.2 320)",
];

/** Click a node to cycle its colour; win with a proper colouring that uses the minimum number of colours. */
export default function ColoringGame({ graph, onComplete, onNewGame }: GameProps) {
  const t = useTranslations("games.coloring");
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
      const next = current === undefined ? 0 : current + 1 < PALETTE.length ? current + 1 : undefined;
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
      seed={graph.seed}
    >
      <GraphBoard
        graph={graph}
        ariaLabel={t("name")}
        showWeights={false}
        nodeFill={(id) => (colors[id] === undefined ? undefined : PALETTE[colors[id]!])}
        onNodeClick={result ? undefined : cycle}
        edgeVisual={(e) => (conflictIds.has(e.id) ? "wrong" : "idle")}
      />
    </GameShell>
  );
}
