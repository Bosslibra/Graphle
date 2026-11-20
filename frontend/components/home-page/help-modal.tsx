"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarDays, ClockFading, Dumbbell, HelpCircle, Swords } from "lucide-react";
import { MODES } from "@/components/game/games/registry";

const ICONS = { daily: CalendarDays, practice: Dumbbell, timed: ClockFading, challenge: Swords };

export default function HelpModal() {
  const t = useTranslations("home-page.help-modal");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 rounded-xl" aria-label={t("how-to-play")}>
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("how-to-play")}</DialogTitle>
          <DialogDescription>{t("how-to-play-description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          {MODES.map((mode) => {
            const Icon = ICONS[mode];
            return (
              <div key={mode} className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Icon className="h-4 w-4" />
                  {t(`mode-${mode}`)}
                </span>
                <p>{t(`mode-${mode}-desc`)}</p>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
