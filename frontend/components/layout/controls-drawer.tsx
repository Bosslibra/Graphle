"use client"

import { useState } from "react"
import { Settings2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeSwitch } from "@/components/switches/theme-switch"
import { LocaleSwitch } from "@/components/switches/locale-switch"
import { SkinSwitch } from "@/components/switches/skin-switch"

/** Theme, skin and language: inline on larger screens, in a side sheet on phones. */
export function ControlsDrawer() {
  const [open, setOpen] = useState(false)
  const t = useTranslations("controls-drawer")

  const rows = [
    { control: <ThemeSwitch />, label: t("theme") },
    { control: <SkinSwitch />, label: t("skin") },
    { control: <LocaleSwitch />, label: t("language") },
  ]

  return (
    <>
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t("open")}>
              <Settings2 className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-64 border-l border-border/60 p-6 backdrop-blur-md [background:var(--graphle-muted-bg)]"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <SheetHeader className="mb-4 p-0">
              <SheetTitle>{t("title")}</SheetTitle>
              <SheetDescription className="sr-only">{t("title")}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4">
              {rows.map(({ control, label }) => (
                <div key={label} className="flex items-center gap-3">
                  {control}
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden items-center gap-1.5 sm:flex">
        {rows.map(({ control, label }) => (
          <div key={label}>{control}</div>
        ))}
      </div>
    </>
  )
}
