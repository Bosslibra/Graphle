"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import GraphBoard from "@/components/game/graph-board";
import GameShell, { NodeChip, ShellResult } from "@/components/game/game-shell";
import { GameProps } from "@/components/game/games/types";
import { minVertexCover } from "@/lib/graph/algorithms";

/** Click nodes to place guards; win when every edge is watched with the fewest guards (minimum vertex cover). */
export default function GuardsGame({ graph, onComplete, onNewGame }: GameProps) {
  const t = useTranslations("games.guards");
  const best = useMemo(() => new Set(minVertexCover(graph)), [graph]);

  const [guards, setGuards] = useState<ReadonlySet<string>>(new Set());
  const [result, setResult] = useState<ShellResult | null>(null);

  const watched = (e: { source: string; target: string }) => guards.has(e.source) || guards.has(e.target);
  const open = graph.edges.filter((e) => !watched(e)).length;

  function toggle(id: string) {
    setGuards((g) => {
      const next = new Set(g);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reset() {
    setGuards(new Set());
    setResult(null);
  }

  function submit() {
    const won = guards.size === best.size;
    setResult({
      won,
      title: won ? t("won") : t("lost"),
      detail: won ? t("wonDetail", { used: guards.size }) : t("lostDetail", { used: guards.size, best: best.size }),
    });
    onComplete?.({ won, score: `${guards.size}/${best.size}` });
  }

  const sorted = [...guards].sort();
  const showBest = result !== null && !result.won;

  return (
    <GameShell
      info={t("info")}
      stat={t("stat", { used: guards.size, open })}
      result={result}
      onReset={reset}
      canSubmit={open === 0}
      onSubmit={submit}
      onNewGame={onNewGame}
      footer={sorted.length > 0 ? sorted.map((id) => <NodeChip key={id} id={id} />) : undefined}
    >
      <GraphBoard
        graph={graph}
        ariaLabel={t("name")}
        showWeights={false}
        activeNodes={guards}
        nodeBadge={(id) => (showBest ? (best.has(id) ? "★" : undefined) : guards.has(id) ? "🛡" : undefined)}
        onNodeClick={result ? undefined : toggle}
        edgeVisual={(e) => (watched(e) ? "active" : "idle")}
      />
    </GameShell>
  );
}
