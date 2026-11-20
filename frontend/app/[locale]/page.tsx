import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Clock3 } from "lucide-react";
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
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-3 px-3 py-2 min-[380px]:gap-4 min-[380px]:py-4 sm:gap-6 sm:px-4 sm:py-8">
      <section className="flex items-start justify-between gap-3 px-1">
        <div className="min-w-0 space-y-1.5">
          <h1 className="font-heading text-xl font-semibold leading-tight tracking-tight min-[380px]:text-2xl sm:text-3xl">
            {t("game-subtitle")}
          </h1>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
            <Clock3 className="h-3.5 w-3.5 shrink-0" />
            {t("next-puzzle")} <CountdownTimer />
          </p>
        </div>
        <HelpModal />
      </section>

      <DailyList />

      <p className="hidden px-2 text-center text-xs text-muted-foreground min-[380px]:block">{t("modes-hint")}</p>
    </div>
  );
}
