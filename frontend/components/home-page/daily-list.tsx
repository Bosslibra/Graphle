"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, CircleCheck, CircleX, Flame, Share2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GAMES } from "@/components/game/games/registry";
import { dailyNumber } from "@/lib/graph/random";
import { DailyResult, useDailyResults, useStreak } from "@/lib/progress";
import { shareOrCopy } from "@/lib/share";

function GameRow({ id, result }: { id: string; result: DailyResult | null }) {
  const game = GAMES.find((g) => g.id === id)!;
  const t = useTranslations(`games.${id}`);

  return (
    <Button asChild variant="ghost" className="group h-12 w-full justify-between rounded-xl px-3">
      <Link href={`/play/${id}`}>
        <span className="flex items-center gap-3">
          <game.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-medium">{t("name")}</span>
            <span className="text-[11px] text-muted-foreground">{t("short")}</span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          {result &&
            (result.won ? (
              <CircleCheck className="h-4 w-4 text-[var(--graph-result-win-fg)]" aria-label="✅" />
            ) : (
              <CircleX className="h-4 w-4 text-[var(--graph-result-loss-fg)]" aria-label="❌" />
            ))}
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </Button>
  );
}

/** Today's puzzles (one per minigame) with completion state, streak and the share summary. */
export default function DailyList() {
  const t = useTranslations("home-page");
  const streak = useStreak();
  const [shareState, setShareState] = useState<string | null>(null);

  const results = useDailyResults(GAMES.map((g) => g.id));

  async function share() {
    const line = GAMES.map((g) => `${g.emoji}${results[g.id] ? (results[g.id]!.won ? "✅" : "❌") : "⬜"}`).join(" ");
    const text = t("shareText", { number: dailyNumber(), line, url: window.location.origin });
    setShareState(await shareOrCopy(text));
  }

  return (
    <div className="flex w-full flex-col gap-1">
      {GAMES.map((g) => (
        <GameRow key={g.id} id={g.id} result={results[g.id]} />
      ))}

      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Flame className="h-3.5 w-3.5" />
          {t("streak", { count: streak })}
        </span>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={share}>
          <Share2 className="h-3.5 w-3.5" />
          {t("share")}
        </Button>
      </div>
      {shareState && (
        <p role="status" className="text-center text-xs text-muted-foreground">
          {t(`shareState.${shareState}`)}
        </p>
      )}
    </div>
  );
}
