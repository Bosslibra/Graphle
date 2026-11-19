"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, RotateCcw, Undo2, XCircle } from "lucide-react";
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
  /** The board. */
  children: ReactNode;
  /** Extra row under the board (e.g. chosen path). */
  footer?: ReactNode;
  result?: ShellResult | null;
  canUndo?: boolean;
  onUndo?: () => void;
  onReset: () => void;
  canSubmit: boolean;
  onSubmit: () => void;
  onNewGame?: () => void;
  seed: string;
}

/** Common frame for every minigame: header, board, result panel and controls. */
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
  seed,
}: GameShellProps) {
  const t = useTranslations("game-shell");
  const finished = !!result;

  return (
    <div className="mx-auto flex w-full max-w-[min(92vw,28rem)] flex-col items-center gap-3 rounded-2xl border border-border/60 p-3 backdrop-blur-md [background:var(--graphle-muted-bg)]">
      <div className="flex w-full items-center justify-between gap-2 px-1 text-sm text-muted-foreground">
        <span>{info}</span>
        {stat && (
          <Badge variant="outline" className="shrink-0 gap-1 text-xs">
            {stat}
          </Badge>
        )}
      </div>

      {children}

      {footer && <div className="flex min-h-[28px] w-full flex-wrap items-center gap-1 px-1">{footer}</div>}

      {result && (
        <div
          role="status"
          className={cn(
            "flex w-full flex-col gap-1 rounded-xl border px-4 py-3",
            result.won
              ? "border-[var(--graph-result-win-border)] bg-[var(--graph-result-win-bg)] text-[var(--graph-result-win-fg)]"
              : "border-[var(--graph-result-loss-border)] bg-[var(--graph-result-loss-bg)] text-[var(--graph-result-loss-fg)]",
          )}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {result.won ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {result.title}
          </div>
          <div className="text-xs text-muted-foreground">{result.detail}</div>
        </div>
      )}

      <div className="flex w-full gap-2">
        {finished ? (
          <>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5 rounded-xl" onClick={onReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              {t("retry")}
            </Button>
            {onNewGame && (
              <Button size="sm" className="flex-1 rounded-xl" onClick={onNewGame}>
                {t("newGame")}
              </Button>
            )}
          </>
        ) : (
          <>
            {onUndo && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 rounded-xl"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo2 className="h-3.5 w-3.5" />
                {t("undo")}
              </Button>
            )}
            <Button variant="outline" size="sm" className="flex-1 gap-1.5 rounded-xl" onClick={onReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              {t("reset")}
            </Button>
            <Button size="sm" className="flex-1 rounded-xl" onClick={onSubmit} disabled={!canSubmit}>
              {t("submit")}
            </Button>
          </>
        )}
      </div>

      <p className="text-center text-[11px] text-muted-foreground/60">
        {t("seed")}: <span className="font-mono">{seed}</span>
      </p>
    </div>
  );
}

/** Small node chip used in path / order footers. */
export function NodeChip({ id }: { id: string }) {
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-[var(--graph-path-chip-border)] bg-[var(--graph-path-chip-bg)] px-1 text-xs font-semibold text-[var(--graph-path-chip-fg)] shadow-sm">
      {id}
    </span>
  );
}
