import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import {use} from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock3, Network } from "lucide-react";

import CountdownTimer from "@/components/home-page/countdown-timer";
import HelpModal from "@/components/home-page/help-modal";


type GameMode = {
  slug: "practice" | "timed" | "custom";
  label: string;
};

const SECONDARY_MODES: GameMode[] = [
  { slug: "practice", label: "Practice" },
  { slug: "timed",    label: "Timed" },
  { slug: "custom",   label: "Custom Challenge" },
];



export default function HomePage({
  params
}: { 
  params: Promise<{locale: string}>
}) {
  const { locale } = use(params);
  setRequestLocale(locale)
  const t = useTranslations("home-page");


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      
      {/* Help Modal */}
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <HelpModal />
      </div>

      {/* Center content */}
      <div className="flex w-full max-w-xs flex-col items-center gap-6 text-center">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-card">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("game-title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("game-subtitle")}
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="h-4 w-4 shrink-0" />
          <span>
            {t("next-puzzle")} <CountdownTimer />
          </span>
        </div>

        {/* Primary CTA */}
        <Button
          asChild
          size="lg"
          className="h-11 w-full rounded-xl"
        >
          <Link href="/play/daily">
            {t("play-daily")}
          </Link>
        </Button>

        <Separator />

        {/* Secondary modes */}
        <div className="flex w-full flex-col gap-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {t("other-modes")}
          </p>
          {SECONDARY_MODES.map((mode) => (
            <Button
              key={mode.slug}
              asChild
              variant="ghost"
              className="w-full justify-between rounded-xl text-sm"
            >
              <Link href={`/play/${mode.slug}`}>
                {mode.label}
                <span className="text-muted-foreground">→</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}