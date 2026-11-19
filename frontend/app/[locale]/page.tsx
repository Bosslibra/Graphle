import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock3, Network } from "lucide-react";
import CountdownTimer from "@/components/home-page/countdown-timer";
import HelpModal from "@/components/home-page/help-modal";
import DailyList from "@/components/home-page/daily-list";

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("home-page");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-foreground sm:py-8">
      {/* Help — fixed so it stays visible on scroll */}
      <div className="fixed right-4 top-4 z-40 sm:right-6 sm:top-6">
        <HelpModal />
      </div>

      <Card className="relative mx-4 w-full max-w-sm border-border/70 shadow-2xl backdrop-blur-lg sm:mx-0 lg:max-w-md [background:var(--graphle-surface-bg)]">
        <CardHeader className="items-center text-center">
          <div className="relative m-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background/80 shadow-sm sm:h-14 sm:w-14">
            <div className="pointer-events-none absolute inset-[0.35rem] bg-primary/85 [mask-image:var(--skin-brand-icon)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
            <Network className="relative h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
          </div>
          <CardTitle className="font-heading text-2xl font-semibold tracking-tight">
            <h1>{t("game-title")}</h1>
          </CardTitle>
          <CardDescription className="text-sm leading-snug">{t("game-subtitle")}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          <Badge
            variant="outline"
            className="h-auto gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground"
          >
            <Clock3 className="h-3.5 w-3.5 shrink-0" />
            {t("next-puzzle")} <CountdownTimer />
          </Badge>

          <div className="flex w-full items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("today")}
            </span>
            <Separator className="flex-1" />
          </div>

          <DailyList />

          <p className="px-2 text-center text-[11px] text-muted-foreground">{t("modes-hint")}</p>
        </CardContent>

        <CardFooter className="justify-center pb-2 pt-0">
          <p className="text-[12px] text-muted-foreground/60">
            {t("game-title")} &ndash; {new Date().getFullYear()}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
