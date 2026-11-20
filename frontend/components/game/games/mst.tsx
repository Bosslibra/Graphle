"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import GraphBoard from "@/components/game/graph-board";
import GameShell, { NodeChip, ShellResult } from "@/components/game/game-shell";
import { GameProps } from "@/components/game/games/types";
import { isSpanningTree, kruskal } from "@/lib/graph/algorithms";

/** Pick n − 1 edges; win if they form a spanning tree of minimum weight (any MST counts). */
export default function MstGame({ graph, onComplete, onNewGame }: GameProps) {
  const t = useTranslations("games.mst");
  const needed = graph.nodes.length - 1;
  const best = useMemo(() => kruskal(graph), [graph]);
  const bestIds = useMemo(() => new Set(best.edges.map((e) => e.id)), [best]);

  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<ShellResult | null>(null);

  const chosen = graph.edges.filter((e) => selected.includes(e.id));
  const weight = chosen.reduce((s, e) => s + e.weight, 0);
  const touched = new Set(chosen.flatMap((e) => [e.source, e.target]));

  function toggle(id: string) {
    if (result) return;
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function reset() {
    setSelected([]);
    setResult(null);
  }

  function submit() {
    const tree = isSpanningTree(graph, chosen);
    const won = tree && weight === best.weight;
    setResult({
      won,
      title: won ? t("won") : t("lost"),
      detail: won
        ? t("wonDetail", { weight })
        : tree
          ? t("lostDetail", { weight, best: best.weight })
          : t("notTree", { best: best.weight }),
    });
    onComplete?.({ won, score: `${weight}/${best.weight}` });
  }

  return (
    <GameShell
      info={t("info", { count: selected.length, needed })}
      stat={t("stat", { weight })}
      result={result}
      canUndo={selected.length > 0}
      onUndo={() => setSelected((s) => s.slice(0, -1))}
      onReset={reset}
      canSubmit={selected.length === needed}
      onSubmit={submit}
      onNewGame={onNewGame}
      footer={chosen.map((e) => (
        <NodeChip key={e.id} id={`${e.source}–${e.target} ${e.weight}`} />
      ))}
    >
      <GraphBoard
        graph={graph}
        ariaLabel={t("name")}
        activeNodes={touched}
        onEdgeClick={result ? undefined : (e) => toggle(e.id)}
        edgeVisual={(e) => {
          const picked = selected.includes(e.id);
          if (result && !result.won) {
            if (bestIds.has(e.id)) return "correct";
            if (picked) return "wrong";
            return "dimmed";
          }
          if (result?.won) return picked ? "correct" : "dimmed";
          return picked ? "active" : "idle";
        }}
      />
    </GameShell>
  );
}
