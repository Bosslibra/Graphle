"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ChevronRight, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import GraphBoard from "@/components/game/graph-board";
import { Edge, GameStatus, GraphResponse } from "@/components/game/types";
import { dijkstra } from "@/components/game/helpers";



interface GraphSessionProps {
  graph: GraphResponse;
  sourceNode?: string;
  targetNode?: string;
  onComplete?: (won: boolean, userCost: number, bestCost: number) => void;
  onRestart?: () => void;
  showSeed?: boolean;
}

export default function GraphSession({
  graph,
  sourceNode,
  targetNode,
  onComplete,
  onRestart,
  showSeed = true,
}: GraphSessionProps) {
  const t = useTranslations("game-session");
  const src = sourceNode ?? graph.nodes[0].id;
  const tgt = targetNode ?? graph.nodes[graph.nodes.length - 1].id;

  const { path: bestPath, cost: bestCost } = useMemo(
    () => dijkstra(graph.nodes, graph.edges, src, tgt),
    [graph.nodes, graph.edges, src, tgt],
  );

  const seedKey = `${graph.seed}::${src}`;
  const [prevSeedKey, setPrevSeedKey] = useState(seedKey);
  const [gameState, setGameState] = useState<{ selected: string[]; status: GameStatus }>({
    selected: [src],
    status: "playing",
  });

  if (prevSeedKey !== seedKey) {
    setPrevSeedKey(seedKey);
    setGameState({ selected: [src], status: "playing" });
  }

  const { selected, status } = gameState;

  const userCost = useCallback(() => {
    let total = 0;

    for (let i = 0; i < selected.length - 1; i++) {
      const a = selected[i];
      const b = selected[i + 1];
      const edge = graph.edges.find(
        (item) =>
          (item.source === a && item.target === b) ||
          (item.source === b && item.target === a),
      );

      if (edge) {
        total += edge.weight;
      }
    }

    return total;
  }, [graph.edges, selected]);

  function handleNodeClick(nodeId: string) {
    if (status !== "playing") {
      return;
    }

    const last = selected[selected.length - 1];
    if (nodeId === last) {
      return;
    }

    const connected = graph.edges.some(
      (edge) =>
        (edge.source === last && edge.target === nodeId) ||
        (edge.source === nodeId && edge.target === last),
    );
    if (!connected) {
      return;
    }

    const next = [...selected, nodeId];
    setGameState((prev) => ({
      selected: next,
      status: nodeId === tgt ? "pathCompleted" : prev.status,
    }));
  }

  function handleUndo() {
    if (selected.length <= 1 || status !== "playing") {
      return;
    }

    setGameState((prev) => ({ ...prev, selected: prev.selected.slice(0, -1) }));
  }

  function handleReset() {
    setGameState({ selected: [src], status: "playing" });
  }

  function handleSubmit() {
    const cost = userCost();
    const won = cost === bestCost;
    setGameState((prev) => ({ ...prev, status: won ? "won" : "lost" }));
    onComplete?.(won, cost, bestCost);
  }

  const currentCost = userCost();
  const showBestPath = status === "won" || status === "lost";

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <style>{`
        @keyframes drawEdge {
          from { stroke-dashoffset: 1; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      <div className="flex w-full items-center justify-between text-sm text-muted-foreground px-1">
        <span>
          {t("from")} <span className="font-semibold">{src}</span> {" -> "}
          <span className="font-semibold">{tgt}</span>
        </span>
        <Badge variant="outline" className="text-xs gap-1">
          {t("cost")}: <span className="font-semibold text-foreground">{currentCost}</span>
        </Badge>
      </div>

      <GraphBoard
        graph={graph}
        sourceNode={src}
        targetNode={tgt}
        selected={selected}
        status={status}
        bestPath={bestPath}
        showBestPath={showBestPath}
        onNodeClick={handleNodeClick}
      />

      <div className="flex w-full items-center gap-1 flex-wrap min-h-[28px] px-1">
        {selected.map((id, i) => (
          <span key={i} className="flex items-center gap-1 text-sm">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold text-white bg-foreground/70 shadow-sm transition-colors duration-300">
              {id}
            </span>
            {i < selected.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </span>
        ))}
      </div>

      {(status === "won" || status === "lost") && (
        <>
          <Separator />
          <div
            className={cn(
              "w-full rounded-xl border px-4 py-3 flex flex-col gap-1",
              status === "won"
                ? "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400"
                : "border-destructive/30 bg-destructive/5 text-destructive",
            )}
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              {status === "won" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {status === "won" ? t("result.wonTitle") : t("result.lostTitle")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("result.yourCost")}: <span className="font-semibold text-foreground">{currentCost}</span>
              {status === "lost" && (
                <>
                  {" · "}{t("result.best")}: <span className="font-semibold text-foreground">{bestCost}</span>
                  {" · "}{t("result.optimal")}: {bestPath.join(" -> ")}
                </>
              )}
            </p>
          </div>
        </>
      )}

      <div className="flex w-full gap-2">
        {status === "pathCompleted" ? (
          <>
            <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={handleReset}>
              {t("controls.back")}
            </Button>
            <Button size="sm" className="flex-1 rounded-xl" onClick={handleSubmit}>
              {t("controls.submit")}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl"
              onClick={handleUndo}
              disabled={selected.length <= 1 || status !== "playing"}
            >
              {t("controls.undo")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl gap-1.5"
              onClick={status !== "playing" ? (onRestart ?? handleReset) : handleReset}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {status !== "playing" ? t("controls.newGame") : t("controls.reset")}
            </Button>
          </>
        )}
      </div>

      {showSeed && (
        <p className="text-[11px] text-muted-foreground/60 text-center">
          {t("seed")}: <span className="font-mono">{graph.seed}</span>
        </p>
      )}
    </div>
  );
}
