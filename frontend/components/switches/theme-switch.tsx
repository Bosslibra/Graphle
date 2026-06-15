"use client"

import { Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useSiteSkin } from "@/contexts/site-skin-context"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"


export function ThemeSwitch() {
    const { currentMode, setMode } = useSiteSkin()
  const t = useTranslations("theme-switch")

  const isDark = currentMode === "dark"

  function toggleTheme() {
    setMode(isDark ? "light" : "dark")
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-popover hover:bg-accent"
          onClick={toggleTheme}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{t("toggle-theme")}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isDark ? t("light") : t("dark")}</p>
      </TooltipContent>
    </Tooltip>
  )
}
