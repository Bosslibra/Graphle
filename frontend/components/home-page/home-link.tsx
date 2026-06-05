import { Home } from "lucide-react"
import { useTranslations } from "next-intl"

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
          <Home className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("home")}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t("home")}</p>
      </TooltipContent>
    </Tooltip>
  )
}
