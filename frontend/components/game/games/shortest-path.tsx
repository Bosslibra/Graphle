"use client";

import { Fragment, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import GraphBoard from "@/components/game/graph-board";
import GameShell, { NodeChip, ShellResult } from "@/components/game/game-shell";
import { GameProps } from "@/components/game/games/types";
import { adjacency, dijkstra } from "@/lib/graph/algorithms";
import { findEdge, pairKey } from "@/lib/graph/types";

/** Click nodes from S to T; win if the path cost equals Dijkstra's. */
export default function ShortestPathGame({ graph, onComplete, onNewGame }: GameProps) {
  const t = useTranslations("games.shortest-path");
  const src = graph.source ?? graph.nodes[0].id;
  const tgt = graph.target ?? graph.nodes[graph.nodes.length - 1].id;
  const best = useMemo(() => dijkstra(graph, src, tgt), [graph, src, tgt]);
  const adj = useMemo(() => adjacency(graph), [graph]);

  const [path, setPath] = useState<string[]>([src]);
  const [result, setResult] = useState<ShellResult | null>(null);

  const last = path[path.length - 1];
  const cost = path.slice(1).reduce((sum, id, i) => sum + (findEdge(graph.edges, path[i], id)?.weight ?? 0), 0);
  const arrived = last === tgt;

  const clickable = useMemo(
    () => (result || arrived ? new Set<string>() : new Set(adj[last].map((n) => n.to).filter((id) => !path.includes(id)))),
    [adj, last, path, result, arrived],
  );

  const userEdges = useMemo(() => new Set(path.slice(1).map((id, i) => pairKey(path[i], id))), [path]);
  const bestEdges = useMemo(() => new Set(best.path.slice(1).map((id, i) => pairKey(best.path[i], id))), [best]);
  const directions = useMemo(() => {
    const map = new Map<string, { from: string; to: string }>();
    path.slice(1).forEach((id, i) => map.set(pairKey(path[i], id), { from: path[i], to: id }));
    return map;
  }, [path]);

  function reset() {
    setPath([src]);
    setResult(null);
  }

  function submit() {
    const won = cost === best.cost;
    setResult({
      won,
      title: won ? t("won") : t("lost"),
      detail: won
        ? t("wonDetail", { cost })
        : t("lostDetail", { cost, best: best.cost, path: best.path.join(" → ") }),
    });
    onComplete?.({ won, score: `${cost}/${best.cost}` });
  }

  return (
    <GameShell
      info={t("info", { src, tgt })}
      stat={t("stat", { cost })}
      result={result}
      canUndo={path.length > 1}
      onUndo={() => setPath((p) => (p.length > 1 ? p.slice(0, -1) : p))}
      onReset={reset}
      canSubmit={arrived}
      onSubmit={submit}
      onNewGame={onNewGame}
      seed={graph.seed}
      footer={path.map((id, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          <NodeChip id={id} />
        </Fragment>
      ))}
    >
      <GraphBoard
        graph={graph}
        ariaLabel={t("name")}
        hueStart={src}
        hueEnd={tgt}
        activeNodes={new Set([...path, tgt])}
        focusNode={result ? undefined : last}
        clickableNodes={clickable}
        onNodeClick={(id) => setPath((p) => [...p, id])}
        edgeDirection={(e) => directions.get(pairKey(e.source, e.target))}
        edgeVisual={(e) => {
          const key = pairKey(e.source, e.target);
          if (result && !result.won) {
            if (bestEdges.has(key)) return "correct";
            if (userEdges.has(key)) return "wrong";
            return "dimmed";
          }
          return userEdges.has(key) ? "active" : "idle";
        }}
      />
    </GameShell>
  );
}
