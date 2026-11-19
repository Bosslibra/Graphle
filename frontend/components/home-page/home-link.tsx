import { Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function HomeLink() {
  const t = useTranslations("home-link");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="outline" size="icon">
          <Link href="/" aria-label={t("home")}>
            <Home className="h-[1.2rem] w-[1.2rem]" />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t("home")}</p>
      </TooltipContent>
    </Tooltip>
  );
}
