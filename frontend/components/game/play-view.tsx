"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, ClockFading, Dumbbell, Share2, Swords, Timer } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import GameExplainer from "@/components/game/game-explainer";
import { GameResult } from "@/components/game/games/types";
import { getGame, Mode, MODES } from "@/components/game/games/registry";
import { dailyNumber, randomSeed } from "@/lib/graph/random";
import { saveDailyResult, useDailyResult } from "@/lib/progress";
import { shareOrCopy } from "@/lib/share";

const TIMED_SECONDS = 120;

const MODE_ICONS = { daily: CalendarDays, practice: Dumbbell, timed: ClockFading, challenge: Swords };

interface PlayViewProps {
  gameId: string;
  mode: Mode;
  /** Seed chosen by the server (daily seed, URL seed or a fresh random one). */
  initialSeed: string;
}

export default function PlayView({ gameId, mode, initialSeed }: PlayViewProps) {
  const game = getGame(gameId)!;
  const t = useTranslations("play");
  const tg = useTranslations(`games.${gameId}`);
  const router = useRouter();

  const [seed, setSeed] = useState(initialSeed);
  const graph = useMemo(() => game.generate(seed), [seed, game]);
  const Game = game.Component;

  // ── daily ──
  const today = useDailyResult(gameId);
  const [shareState, setShareState] = useState<string | null>(null);

  // ── timed ──
  const [remaining, setRemaining] = useState(TIMED_SECONDS);
  const [solved, setSolved] = useState(0);
  const [timedRun, setTimedRun] = useState(0);
  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (mode !== "timed") return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [mode, timedRun]);

  useEffect(() => () => {
    if (nextTimer.current) clearTimeout(nextTimer.current);
  }, []);

  const timeUp = mode === "timed" && remaining === 0;

  function newRandomGame() {
    const next = randomSeed();
    if (mode === "challenge") {
      router.replace(`/play/${gameId}?mode=challenge&seed=${next}`);
    } else {
      setSeed(next);
    }
  }

  function handleComplete(result: GameResult) {
    if (mode === "daily") {
      saveDailyResult(gameId, result);
    }
    if (mode === "timed" && result.won && remaining > 0) {
      setSolved((s) => s + 1);
      nextTimer.current = setTimeout(() => setSeed(randomSeed()), 900);
    }
  }

  function restartTimed() {
    setSolved(0);
    setRemaining(TIMED_SECONDS);
    setTimedRun((r) => r + 1);
    setSeed(randomSeed());
  }

  async function shareDaily() {
    if (!today) return;
    const text = t("daily.shareText", {
      number: dailyNumber(),
      game: tg("name"),
      emoji: game.emoji,
      result: today.won ? "✅" : "❌",
      score: today.score,
      url: window.location.origin,
    });
    setShareState(await shareOrCopy(text));
  }

  async function shareChallenge() {
    const url = `${window.location.origin}${window.location.pathname}?mode=challenge&seed=${seed}`;
    setShareState(await shareOrCopy(t("challenge.shareText", { game: tg("name"), url })));
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      {/* Title */}
      <div className="flex w-full items-center justify-between gap-2 px-1 pt-10 sm:pt-0">
        <div className="flex items-center gap-2">
          <game.icon className="h-5 w-5" strokeWidth={1.5} />
          <h1 className="font-heading text-xl font-semibold tracking-tight">{tg("name")}</h1>
        </div>
        <GameExplainer gameId={gameId} />
      </div>

      {/* Mode tabs */}
      <nav aria-label={t("modes")} className="grid w-full grid-cols-4 gap-1 rounded-xl border border-border/60 p-1 [background:var(--graphle-muted-bg)]">
        {MODES.map((m) => {
          const Icon = MODE_ICONS[m];
          return (
            <Link
              key={m}
              href={`/play/${gameId}?mode=${m}`}
              aria-current={m === mode ? "page" : undefined}
              className={cn(
                "flex items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-xs transition-colors",
                m === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t(`mode.${m}`)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mode-specific header */}
      <div className="flex min-h-6 w-full items-center justify-between px-1 text-xs text-muted-foreground">
        {mode === "daily" && (
          <>
            <span>{t("daily.number", { number: dailyNumber() })}</span>
            {today && (
              <Badge variant="outline">
                {t("daily.done", { result: today.won ? "✅" : "❌", score: today.score })}
              </Badge>
            )}
          </>
        )}
        {mode === "practice" && <span>{t("practice.hint")}</span>}
        {mode === "timed" && (
          <>
            <span>
              {t("timed.solved")}: <strong className="text-foreground">{solved}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" />
              <strong className="font-mono text-foreground tabular-nums">
                {mm}:{ss}
              </strong>
            </span>
          </>
        )}
        {mode === "challenge" && <span>{t("challenge.hint")}</span>}
      </div>

      {timeUp ? (
        <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-border/60 p-6 text-center [background:var(--graphle-muted-bg)]">
          <p className="text-lg font-semibold">{t("timed.over")}</p>
          <p className="text-sm text-muted-foreground">{t("timed.result", { solved })}</p>
          <Button className="rounded-xl" onClick={restartTimed}>
            {t("timed.again")}
          </Button>
        </div>
      ) : (
        <Game
          key={seed}
          graph={graph}
          onComplete={handleComplete}
          onNewGame={mode === "daily" ? undefined : newRandomGame}
        />
      )}

      {/* Share actions */}
      {mode === "daily" && today && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={shareDaily}>
            <Share2 className="h-3.5 w-3.5" />
            {t("daily.share")}
          </Button>
          <Button asChild size="sm" variant="ghost" className="rounded-xl">
            <Link href="/">{t("daily.otherGames")}</Link>
          </Button>
        </div>
      )}
      {mode === "challenge" && (
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={shareChallenge}>
          <Share2 className="h-3.5 w-3.5" />
          {t("challenge.share")}
        </Button>
      )}
      {shareState && (
        <p role="status" className="text-xs text-muted-foreground">
          {t(`shareState.${shareState}`)}
        </p>
      )}
    </div>
  );
}
