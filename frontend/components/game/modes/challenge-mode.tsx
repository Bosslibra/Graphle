"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import GraphSession from "@/components/game/graph-session";
import { GraphResponse } from "@/components/game/types";
import { Button } from "@/components/ui/button";

interface ChallengeModeProps {
  graph: GraphResponse;
}

export default function ChallengeMode({ graph }: ChallengeModeProps) {
  const t = useTranslations("play-modes.challenge");
  const [copied, setCopied] = useState(false);

  async function copySeed() {
    await navigator.clipboard.writeText(graph.seed);
    setCopied(true);
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex w-full justify-center">
        <GraphSession graph={graph} />
      </div>

      <Button variant="outline" size="sm" onClick={copySeed}>
        {copied ? t("copied") : t("copySeed")}
      </Button>
    </div>
  );
}
