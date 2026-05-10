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
import { Dumbbell, HelpCircle, Hourglass, ClockFading, Swords } from "lucide-react";

export default function HelpModal() {
  const t = useTranslations("home-page.help-modal");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("how-to-play")}>
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("how-to-play")}</DialogTitle>
          <DialogDescription>{t("how-to-play-description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-foreground"><Hourglass className="h-4 w-4 inline-block mr-1" />{t("mode-daily")}</span>
            <p>{t("mode-daily-desc")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-foreground"><Dumbbell className="h-4 w-4 inline-block mr-1" />{t("mode-practice")}</span>
            <p>{t("mode-practice-desc")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-foreground"><ClockFading className="h-4 w-4 inline-block mr-1" />{t("mode-timed")}</span>
            <p>{t("mode-timed-desc")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-foreground"><Swords className="h-4 w-4 inline-block mr-1" />{t("mode-challenge")}</span>
            <p>{t("mode-challenge-desc")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
