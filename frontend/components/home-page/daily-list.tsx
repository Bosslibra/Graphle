"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CircleCheck, CircleX, Flame, Play, Share2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GAMES } from "@/components/game/games/registry";
import { dailyNumber } from "@/lib/graph/random";
import { DailyResult, useDailyResults, useStreak } from "@/lib/progress";
import { shareOrCopy } from "@/lib/share";

function GameTile({ id, result }: { id: string; result: DailyResult | null }) {
  const game = GAMES.find((g) => g.id === id)!;
  const t = useTranslations(`games.${id}`);
  const th = useTranslations("home-page");

  return (
    <Link
      href={`/play/${id}`}
      className={cn(
        "group flex min-h-28 flex-col justify-between gap-2 rounded-2xl border p-3 min-[380px]:min-h-32 min-[380px]:gap-3 shadow-sm backdrop-blur-md transition-all sm:p-4",
        "[background:var(--graphle-surface-bg)] hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring",
        result ? "border-border/50" : "border-border/70",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <game.icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        {result ? (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] tabular-nums",
              result.won
                ? "border-[var(--graph-result-win-border)] bg-[var(--graph-result-win-bg)] text-[var(--graph-result-win-fg)]"
                : "border-[var(--graph-result-loss-border)] bg-[var(--graph-result-loss-bg)] text-[var(--graph-result-loss-fg)]",
            )}
          >
            {result.won ? <CircleCheck className="h-3 w-3" /> : <CircleX className="h-3 w-3" />}
            {result.score}
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
            <Play className="h-3 w-3" />
            {th("play")}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight sm:text-base">{t("name")}</p>
        <p className="truncate text-xs text-muted-foreground">{t("short")}</p>
      </div>
    </Link>
  );
}

/** Today's puzzles (one per minigame) with completion state, streak and the share summary. */
export default function DailyList() {
  const t = useTranslations("home-page");
  const streak = useStreak();
  const [shareState, setShareState] = useState<string | null>(null);
  const results = useDailyResults(GAMES.map((g) => g.id));
  const played = GAMES.filter((g) => results[g.id]).length;

  async function share() {
    const line = GAMES.map((g) => `${g.emoji}${results[g.id] ? (results[g.id]!.won ? "✅" : "❌") : "⬜"}`).join(" ");
    const text = t("shareText", { number: dailyNumber(), line, url: window.location.origin });
    setShareState(await shareOrCopy(text));
    setTimeout(() => setShareState(null), 2000);
  }

  return (
    <section className="flex flex-col gap-2 min-[380px]:gap-3" aria-label={t("today")}>
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span className="font-medium uppercase tracking-widest">
          {t("today")} · #{dailyNumber()}
        </span>
        <span>
          {played}/{GAMES.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {GAMES.map((g) => (
          <GameTile key={g.id} id={g.id} result={results[g.id]} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 px-1">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Flame className={cn("h-4 w-4", streak > 0 && "text-primary")} />
          {t("streak", { count: streak })}
        </span>
        <Button variant="outline" className="h-9 gap-1.5 rounded-xl" onClick={share} disabled={played === 0}>
          <Share2 className="h-4 w-4" />
          {shareState ? t(`shareState.${shareState}`) : t("share")}
        </Button>
      </div>
    </section>
  );
}
