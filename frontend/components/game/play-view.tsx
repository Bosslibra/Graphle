"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, ClockFading, Dumbbell, Share2, Swords, Timer } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
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

  /** Shows the share outcome on the button for 2 seconds. */
  function flash(state: string) {
    setShareState(state);
    setTimeout(() => setShareState(null), 2000);
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
    flash(await shareOrCopy(text));
  }

  async function shareChallenge() {
    const url = `${window.location.origin}${window.location.pathname}?mode=challenge&seed=${seed}`;
    flash(await shareOrCopy(t("challenge.shareText", { game: tg("name"), url })));
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const shareLabel = shareState ? t(`shareState.${shareState}`) : null;

  return (
    // Exactly one screen tall (below the header) so the board and controls never scroll off;
    // very short screens fall back to scrolling thanks to min-h.
    <div className="mx-auto flex h-[calc(100dvh-var(--header-h))] min-h-[460px] w-full max-w-lg flex-col gap-2 px-3 pb-3 pt-2 sm:gap-3 sm:px-4 sm:pt-4">
      {/* Title */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <game.icon className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} />
          <h1 className="truncate font-heading text-lg font-semibold tracking-tight sm:text-xl">{tg("name")}</h1>
        </div>
        <GameExplainer gameId={gameId} />
      </div>

      {/* Mode tabs: on narrow screens only the active tab shows its label */}
      <nav
        aria-label={t("modes")}
        className="flex gap-1 rounded-xl border border-border/60 p-1 [background:var(--graphle-muted-bg)]"
      >
        {MODES.map((m) => {
          const Icon = MODE_ICONS[m];
          const active = m === mode;
          return (
            <Link
              key={m}
              href={`/play/${gameId}?mode=${m}`}
              aria-current={active ? "page" : undefined}
              aria-label={t(`mode.${m}`)}
              title={t(`mode.${m}`)}
              className={cn(
                "flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-medium transition-all",
                active
                  ? "flex-[2_1_0%] bg-primary text-primary-foreground shadow-sm"
                  : "flex-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:flex-[2_1_0%]",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={cn("truncate", !active && "hidden sm:inline")}>{t(`mode.${m}`)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mode status line (practice has nothing to show, so no row) */}
      {mode !== "practice" && (
      <div className="flex h-8 items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
        {mode === "daily" && (
          <>
            <span className="truncate">{t("daily.number", { number: dailyNumber() })}</span>
            {today && (
              <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg text-xs" onClick={shareDaily}>
                <span>
                  {today.won ? "✅" : "❌"} {today.score}
                </span>
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden min-[380px]:inline">{shareLabel ?? t("daily.share")}</span>
              </Button>
            )}
          </>
        )}
        {mode === "timed" && (
          <>
            <span>
              {t("timed.solved")}: <strong className="text-foreground">{solved}</strong>
            </span>
            <span
              className={cn(
                "flex items-center gap-1 rounded-lg border border-border/60 px-2 py-1",
                remaining <= 10 && remaining > 0 && "border-[var(--graph-result-loss-border)] text-[var(--graph-result-loss-fg)]",
              )}
            >
              <Timer className="h-3.5 w-3.5" />
              <strong className="font-mono tabular-nums">
                {mm}:{ss}
              </strong>
            </span>
          </>
        )}
        {mode === "challenge" && (
          <>
            <span className="truncate">
              {t("challenge.seed")}: <span className="font-mono text-foreground">{seed}</span>
            </span>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg text-xs" onClick={shareChallenge}>
              <Share2 className="h-3.5 w-3.5" />
              {shareLabel ?? t("challenge.share")}
            </Button>
          </>
        )}
      </div>
      )}

      <div className="flex min-h-0 flex-1">
        {timeUp ? (
          <div className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 p-6 text-center [background:var(--graphle-surface-bg)]">
            <Timer className="h-8 w-8 text-primary" />
            <p className="text-lg font-semibold">{t("timed.over")}</p>
            <p className="text-sm text-muted-foreground">{t("timed.result", { solved })}</p>
            <Button className="h-10 rounded-xl px-6" onClick={restartTimed}>
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
      </div>
    </div>
  );
}
