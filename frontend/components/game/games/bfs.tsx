"use client";

import { Fragment, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import GraphBoard from "@/components/game/graph-board";
import GameShell, { NodeChip, ShellResult } from "@/components/game/game-shell";
import { GameProps } from "@/components/game/games/types";
import { bfsOrder } from "@/lib/graph/algorithms";
import { pairKey } from "@/lib/graph/types";

/** Click the nodes in the order a breadth-first search visits them (neighbours alphabetically). */
export default function BfsGame({ graph, onComplete, onNewGame }: GameProps) {
  const t = useTranslations("games.bfs");
  const src = graph.nodes[0].id;
  const correct = useMemo(() => bfsOrder(graph, src), [graph, src]);

  const [order, setOrder] = useState<string[]>([src]);
  const [result, setResult] = useState<ShellResult | null>(null);

  const visited = new Set(order);
  const remaining = new Set(graph.nodes.map((n) => n.id).filter((id) => !visited.has(id)));

  // During play, light up edges that connect visited nodes so the frontier is visible.
  const visitedEdges = new Set(
    graph.edges.filter((e) => visited.has(e.source) && visited.has(e.target)).map((e) => pairKey(e.source, e.target)),
  );

  function reset() {
    setOrder([src]);
    setResult(null);
  }

  function submit() {
    const right = order.filter((id, i) => correct[i] === id).length;
    const won = right === correct.length;
    setResult({
      won,
      title: won ? t("won") : t("lost"),
      detail: won ? t("wonDetail") : t("lostDetail", { order: correct.join(" → ") }),
    });
    onComplete?.({ won, score: `${right}/${correct.length}` });
  }

  return (
    <GameShell
      info={t("info", { src })}
      stat={t("stat", { count: order.length, total: graph.nodes.length })}
      result={result}
      canUndo={order.length > 1}
      onUndo={() => setOrder((o) => (o.length > 1 ? o.slice(0, -1) : o))}
      onReset={reset}
      canSubmit={remaining.size === 0}
      onSubmit={submit}
      onNewGame={onNewGame}
      footer={order.map((id, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />}
          <NodeChip id={id} />
        </Fragment>
      ))}
    >
      <GraphBoard
        graph={graph}
        ariaLabel={t("name")}
        showWeights={false}
        activeNodes={visited}
        focusNode={result ? undefined : order[order.length - 1]}
        nodeBadge={(id) => {
          const i = (result && !result.won ? correct : order).indexOf(id);
          return i >= 0 ? String(i + 1) : undefined;
        }}
        clickableNodes={result ? new Set() : remaining}
        onNodeClick={(id) => setOrder((o) => [...o, id])}
        edgeVisual={(e) => (visitedEdges.has(pairKey(e.source, e.target)) ? "active" : "idle")}
      />
    </GameShell>
  );
}
