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
import { HelpCircle } from "lucide-react";

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
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">{t("mode-daily")}</span>
            {" — "}{t("mode-daily-desc")}
          </p>
          <p>
            <span className="font-medium text-foreground">{t("mode-practice")}</span>
            {" — "}{t("mode-practice-desc")}
          </p>
          <p>
            <span className="font-medium text-foreground">{t("mode-timed")}</span>
            {" — "}{t("mode-timed-desc")}
          </p>
          <p>
            <span className="font-medium text-foreground">{t("mode-custom")}</span>
            {" — "}{t("mode-custom-desc")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
