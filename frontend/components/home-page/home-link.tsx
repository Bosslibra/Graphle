import { Home } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"


export function HomeLink() {
  const t = useTranslations("home-link")

  function navigateHome() {

  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={navigateHome}>
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-[1.2rem] w-[1.2rem]" />
          </Link>
          <span className="sr-only">{t("home")}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t("home")}</p>
      </TooltipContent>
    </Tooltip>
  )
}
