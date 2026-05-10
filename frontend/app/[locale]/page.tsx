import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock3, Network, Dumbbell, ClockFading, Swords, ChevronRight } from "lucide-react";
import CountdownTimer from "@/components/home-page/countdown-timer";
import HelpModal from "@/components/home-page/help-modal";

type ModeSlug = "practice" | "timed" | "challenge";

const SECONDARY_MODES: { slug: ModeSlug; icon: React.ElementType }[] = [
  { slug: "practice", icon: Dumbbell },
  { slug: "timed",    icon: ClockFading },
  { slug: "challenge", icon: Swords },
];

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("home-page");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-transparent px-4 pt-16 sm:pt-4 text-foreground">

      
      {/* Help — fixed so it stays visible on scroll */}
      <div className="fixed right-4 top-4 sm:right-6 sm:top-6 z-40">
        <HelpModal />
      </div>

      {/* Card */}
      <Card className="relative w-full max-w-sm backdrop-blur-sm lg:max-w-md mx-4 sm:mx-0">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 sm:h-14 sm:w-14 m-auto items-center justify-center rounded-2xl border bg-background shadow-sm">
            <Network className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {t("game-title")}
          </CardTitle>
          <CardDescription className="text-sm leading-snug">
            {t("game-subtitle")}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4 sm:gap-5">
          <Badge
            variant="outline"
            className="h-auto gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground"
          >
            <Clock3 className="h-3.5 w-3.5 shrink-0" />
            {t("next-puzzle")} <CountdownTimer />
          </Badge>

          <Button asChild size="lg" className="h-12 w-full rounded-xl font-medium">
            <Link href="/play/daily">{t("play-daily")}</Link>
          </Button>

          <div className="flex w-full items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("other-modes")}
            </span>
            <Separator className="flex-1" />
          </div>

          <div className="w-full max-w-[180px] sm:max-w-[160px]">
            <div className="flex w-full flex-col gap-2 sm:gap-1.5">
              {SECONDARY_MODES.map(({ slug, icon: Icon }) => (
                <Button
                  key={slug}
                  asChild
                  variant="ghost"
                  className="group h-11 sm:h-10 w-full justify-between rounded-xl px-3 text-sm"
                >
                  <Link href={`/play/${slug}`}>
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      {t(`modes-${slug}`)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-center pb-2 pt-0">
          <p className="text-[12px] text-muted-foreground/60">{t("game-title")} &ndash; {new Date().getFullYear()}</p>
        </CardFooter>
      </Card>
    </div>
  );
}