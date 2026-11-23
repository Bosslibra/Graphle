"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, RotateCcw, Shuffle, Undo2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ShellResult {
  won: boolean;
  title: string;
  detail: ReactNode;
}

interface GameShellProps {
  /** Instruction line, top left. */
  info: ReactNode;
  /** Live counter, top right. */
  stat?: ReactNode;
  /** The board (GraphBoard grows to fill the free space). */
  children: ReactNode;
  /** Row under the board while playing (e.g. chosen path). Replaced by the result when finished. */
  footer?: ReactNode;
  result?: ShellResult | null;
  canUndo?: boolean;
  onUndo?: () => void;
  onReset: () => void;
  canSubmit: boolean;
  onSubmit: () => void;
  onNewGame?: () => void;
}

/**
 * Common frame for every minigame. It fills the height it is given (flex column):
 * header row, board (flexible), one fixed-height row for path/result, controls.
 * All colours come from skin CSS variables.
 */
export default function GameShell({
  info,
  stat,
  children,
  footer,
  result,
  canUndo,
  onUndo,
  onReset,
  canSubmit,
  onSubmit,
  onNewGame,
}: GameShellProps) {
  const t = useTranslations("game-shell");
  const finished = !!result;

  return (
    <section className="flex h-full min-h-0 w-full flex-col gap-2 sm:gap-3">
      <div className="flex min-h-7 items-center justify-between gap-2 px-1 text-sm">
        <span className="truncate font-medium text-foreground/80">{info}</span>
        {stat && (
          <Badge variant="outline" className="shrink-0 gap-1 border-border/60 font-mono text-xs tabular-nums backdrop-blur-sm [background:var(--graphle-surface-bg)]">
            {stat}
          </Badge>
        )}
      </div>

      {children}

      <div className="flex min-h-11 items-center">
        {result ? (
          <div
            role="status"
            className={cn(
              "flex w-full items-start gap-2 rounded-xl border px-3 py-2",
              result.won
                ? "border-[var(--graph-result-win-border)] bg-[var(--graph-result-win-bg)] text-[var(--graph-result-win-fg)]"
                : "border-[var(--graph-result-loss-border)] bg-[var(--graph-result-loss-bg)] text-[var(--graph-result-loss-fg)]",
            )}
          >
            {result.won ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{result.title}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{result.detail}</p>
            </div>
          </div>
        ) : (
          footer && (
            <div className="flex w-full items-center gap-1 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
              {footer}
            </div>
          )
        )}
      </div>

      <div className="flex gap-2">
        {finished ? (
          <>
            <Button variant="outline" className="h-10 flex-1 gap-1.5 rounded-xl" onClick={onReset}>
              <RotateCcw className="h-4 w-4" />
              {t("retry")}
            </Button>
            {onNewGame && (
              <Button className="h-10 flex-1 gap-1.5 rounded-xl" onClick={onNewGame}>
                <Shuffle className="h-4 w-4" />
                {t("newGame")}
              </Button>
            )}
          </>
        ) : (
          <>
            {onUndo && (
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-xl"
                onClick={onUndo}
                disabled={!canUndo}
                aria-label={t("undo")}
                title={t("undo")}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl"
              onClick={onReset}
              aria-label={t("reset")}
              title={t("reset")}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button className="h-10 flex-1 rounded-xl font-medium" onClick={onSubmit} disabled={!canSubmit}>
              {t("submit")}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}

/** Small node chip used in path / order footers. */
export function NodeChip({ id }: { id: string }) {
  return (
    <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md border border-[var(--graph-path-chip-border)] bg-[var(--graph-path-chip-bg)] px-1 text-xs font-semibold text-[var(--graph-path-chip-fg)] shadow-sm">
      {id}
    </span>
  );
}
