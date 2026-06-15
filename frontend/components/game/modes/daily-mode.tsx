"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import GraphSession from "@/components/game/graph-session";
import { getDailyPuzzleNumber } from "@/components/game/helpers";
import { GraphResponse } from "@/components/game/types";
import { Button } from "@/components/ui/button";

interface DailyModeProps {
  graph: GraphResponse;
}

export default function DailyMode({ graph }: DailyModeProps) {
  const t = useTranslations("play-modes.daily");
  const puzzleNumber = useMemo(() => getDailyPuzzleNumber(), []);
  const [shareText, setShareText] = useState<string | null>(null);

  async function handleComplete(won: boolean, userCost: number, bestCost: number) {
    const result = won ? t("shareStatus.solved") : t("shareStatus.tried");
    const text = t("shareText", {
      puzzleNumber,
      result,
      userCost,
      bestCost,
    });
    setShareText(text);
  }

  async function copyShareText() {
    if (!shareText) {
      return;
    }

    await navigator.clipboard.writeText(shareText);
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="text-xs text-muted-foreground">{t("puzzleNumber", { puzzleNumber })}</p>

      <div className="flex w-full justify-center">
        <GraphSession graph={graph} onComplete={handleComplete} />
      </div>

      {shareText && (
        <Button variant="outline" size="sm" onClick={copyShareText}>
          {t("copyResult")}
        </Button>
      )}
    </div>
  );
}
