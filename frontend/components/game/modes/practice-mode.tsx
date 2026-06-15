"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import GraphSession from "@/components/game/graph-session";
import { fetchGraph } from "@/components/game/helpers";
import { GraphResponse } from "@/components/game/types";

interface PracticeModeProps {
  graph: GraphResponse;
}

export default function PracticeMode({ graph: initialGraph }: PracticeModeProps) {
  const t = useTranslations("play-modes.practice");
  const [graph, setGraph] = useState(initialGraph);
  const [isPending, startTransition] = useTransition();

  async function handleRestart() {
    const data = await fetchGraph();
    startTransition(() => setGraph(data));
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      {isPending && <p className="text-xs text-center text-muted-foreground">{t("loading")}</p>}

      <div className="flex w-full justify-center">
        <GraphSession key={graph.seed} graph={graph} onRestart={handleRestart} />
      </div>
    </div>
  );
}
