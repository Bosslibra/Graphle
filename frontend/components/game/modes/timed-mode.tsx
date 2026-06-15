"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import GraphSession from "@/components/game/graph-session";
import { fetchGraph, formatSeconds } from "@/components/game/helpers";
import { GraphResponse } from "@/components/game/types";

const ROUND_SECONDS = 120;

interface TimedModeProps {
  graph: GraphResponse;
}

export default function TimedMode({ graph: initialGraph }: TimedModeProps) {
  const t = useTranslations("play-modes.timed");
  const [graph, setGraph] = useState(initialGraph);
  const [remaining, setRemaining] = useState(ROUND_SECONDS);
  const [solvedCount, setSolvedCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(id);
  }, []);

  async function nextGraph() {
    const data = await fetchGraph();
    startTransition(() => setGraph(data));
  }

  async function handleComplete(won: boolean) {
    if (!won || remaining === 0) {
      return;
    }

    setSolvedCount((prev) => prev + 1);
    await nextGraph();
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex w-full max-w-md items-center justify-between px-1 text-xs text-muted-foreground">
        <span>{t("solved")}: <strong className="text-foreground">{solvedCount}</strong></span>
        <span>{t("timeLeft")}: <strong className="text-foreground">{formatSeconds(remaining)}</strong></span>
      </div>

      {isPending && <p className="text-xs text-center text-muted-foreground">{t("loading")}</p>}

      <div className="flex w-full justify-center">
        <GraphSession
          key={graph.seed}
          graph={graph}
          onComplete={handleComplete}
          onRestart={nextGraph}
        />
      </div>
    </div>
  );
}
