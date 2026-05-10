"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"


export function ThemeSwitch() {
    const { theme, setTheme } = useTheme()
  const t = useTranslations("theme-switch")

  const isDark = theme === "dark"

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={toggleTheme}>
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
