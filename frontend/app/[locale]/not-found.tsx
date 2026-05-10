import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

export default async function NotFound() {
  const locale = await getLocale();
  setRequestLocale(locale);
  const t = await getTranslations("not-found-page");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">{t("title")}</h2>
      <p className="text-muted-foreground">{t("description")}</p>
      <Button asChild>
        <Link href="/">{t("home-link")}</Link>
      </Button>
    </div>
  );
}