import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ControlsDrawer } from "@/components/layout/controls-drawer";
import BrandMark from "@/components/layout/brand-mark";

/** Top bar shared by every page: logo (→ home) and settings. Height: 3.5rem (--header-h). */
export default function SiteHeader() {
  const t = useTranslations("home-link");

  return (
    <header className="sticky top-0 z-40 h-[var(--header-h)] shrink-0 border-b border-border/40 backdrop-blur-md [background:var(--graphle-muted-bg)]">
      <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link
          href="/"
          aria-label={t("home")}
          className="flex items-center gap-2 rounded-lg font-heading text-lg font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandMark className="h-8 w-8" />
          Graphle
        </Link>
        <ControlsDrawer />
      </div>
    </header>
  );
}
