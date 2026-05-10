"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter, usePathname } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Languages } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LocaleSwitch() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("locale-switch")

  function changeLocale(next: string) {
    router.replace(pathname, { locale: next })
  }

  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Languages className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">{t("label")}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <DropdownMenuContent align="start">
          {routing.locales.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => changeLocale(loc)}
              className={loc === locale ? "font-semibold text-primary" : ""}
            >
              {t(loc)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <TooltipContent>
        <p>{t("label")}</p>
      </TooltipContent>
    </Tooltip>
  )
}