"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, ChevronDown, Lightbulb, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { markExplainerSeen, useExplainerSeen } from "@/lib/progress";

/** "How to play" + "A bit of theory" for one minigame. Opens by itself the first time. */
export default function GameExplainer({ gameId }: { gameId: string }) {
  const t = useTranslations(`games.${gameId}`);
  const tc = useTranslations("explainer");
  const seen = useExplainerSeen(gameId);
  const [manualOpen, setManualOpen] = useState(false);
  const open = manualOpen || !seen;

  function handleOpenChange(next: boolean) {
    setManualOpen(next);
    if (!next) markExplainerSeen(gameId);
  }

  const rules = t.raw("rules") as string[];
  const theory = t.raw("theory") as string[];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 rounded-lg">
          <BookOpen className="h-4 w-4" />
          {tc("open")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("name")}</DialogTitle>
          <DialogDescription>{t("tagline")}</DialogDescription>
        </DialogHeader>

        <section className="space-y-2 text-sm">
          <h3 className="flex items-center gap-2 font-semibold">
            <ListChecks className="h-4 w-4" />
            {tc("rules")}
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {rules.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <details className="group space-y-2 text-sm">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <Lightbulb className="h-4 w-4" />
            {tc("theory")}
            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-2 pt-2">
            {theory.map((p) => (
              <p key={p} className="leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
            <a
              href={t("link")}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs underline underline-offset-4"
            >
              {tc("readMore")}
            </a>
          </div>
        </details>

        <Button className="w-full rounded-xl" onClick={() => handleOpenChange(false)}>
          {tc("start")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
